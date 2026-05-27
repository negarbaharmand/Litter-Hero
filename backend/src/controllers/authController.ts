import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend'; 
import { createHash, randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY): null;


const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3).max(50, 'Username must be between 3 and 50 characters').optional(),
  name: z.string().max(100).optional(),
  
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleSchema = z.union([
  z.object({ idToken: z.string().min(1), accessToken: z.undefined().optional() }),
  z.object({ accessToken: z.string().min(1), idToken: z.undefined().optional() }),
]).refine(
  (val) => val.idToken || val.accessToken,
  { message: 'Either idToken or accessToken is required' }
);

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'), 
  token: z.string().min(1, 'Token is required')
})

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})
type PgErrorLike = { code?: string; constraint_name?: string };

function getResendRecipientRestrictionMessage(error: unknown): string | null {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('You can only send testing emails to your own email address')) {
    return message;
  }
  return null;
}

function getUniqueViolation(error: unknown): PgErrorLike | null {
  for (const e of [error, (error as { cause?: unknown })?.cause]) {
    if (e && typeof e === 'object' && (e as PgErrorLike).code === '23505') {
      return e as PgErrorLike;
    }
  }
  return null;
}

function duplicateUserMessage(constraint?: string): string {
  if (constraint === 'users_email_unique') return 'Email is already registered';
  if (constraint === 'users_username_unique') return 'Username is already taken';
  return 'Email or username is already in use';
}
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}
function hashVerificationToken(token: string):string{
  return createHash('sha256').update(token).digest('hex');
}

function buildVerificationLink(email: string, token: string): string {
  const base = APP_URL.replace(/\/$/, '');
  const query = new URLSearchParams({email, token});
  return base + '/verify-email?' + query.toString(); 
}

async function sendVerificationEmail(email:string, verifyLink: string): Promise<void>{
  if(!resend){
    console.log('[email-verification] RESEND_API_KEY missing: link:', verifyLink )
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td align="center" style="background-color:#1a1a1a;padding:32px 40px;">
            <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:2px;color:#ffffff;">LITTER <span style="color:#4ade80;">Hero</span></p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">Verify your email address</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
              Thanks for signing up! Click the button below to verify your email and activate your account.
              The link expires in <strong>1 hour</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td align="center" style="background-color:#4ade80;border-radius:8px;">
                  <a href="${verifyLink}" target="_blank"
                    style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#1a1a1a;text-decoration:none;">
                    Verify my email
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#888888;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
              <a href="${verifyLink}" style="color:#4ade80;">${verifyLink}</a>
            </p>
            <p style="margin:0;font-size:13px;color:#aaaaaa;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;">
            <p style="margin:0;font-size:12px;color:#aaaaaa;text-align:center;">
              &copy; ${new Date().getFullYear()} Litter Hero &mdash; Making the world a cleaner place.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Verify your Litter Hero account',
    html,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  console.log('[email-verification] sent', { emailId: data?.id, to: email });
}

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }


  try {
    const { email, password, name, username } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken); 
    const expiresAt = new Date(Date.now() + 60*60*1000);
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name ?? null,
      username: username ?? null,
      emailVerifiedAt: null, 
      emailVerificationToken: tokenHash, 
      emailVerificationTokenExpiresAt: expiresAt,
    }).returning();
    if (!newUser) {
      return res.status(500).json({ error: 'Could not register user' });
    }
    const verifyLink = buildVerificationLink(newUser.email, rawToken); 
    await sendVerificationEmail(newUser.email, verifyLink);

    return res.status(201).json({
      message: 'Account created. Please verify your email before logging in.',
    })
    
    

    } catch (error) {
    const uniqueViolation = getUniqueViolation(error);
    if (uniqueViolation) {
      return res.status(409).json({ error: duplicateUserMessage(uniqueViolation.constraint_name) });
    }
    const resendRestriction = getResendRecipientRestrictionMessage(error);
    if (resendRestriction) {
      return res.status(400).json({ error: resendRestriction });
    }
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (_req: Request, res: Response) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is missing' });
  }

  try {
    const { email, password } = parsed.data;

    const [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!foundUser || !foundUser.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if(!foundUser.emailVerifiedAt){
      return res.status(403).json({error: 'Please verify your email before logging in.'})
    }
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...user } = foundUser;

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
export const verifyEmail= async(req:Request, res:Response) =>{
  const parsed = verifyEmailSchema.safeParse(req.body);
  if(!parsed.success){
    return res.status(400).json({error : parsed.error.issues[0]?.message ?? 'invalid input'});
  }
  try{
    const { email, token } = parsed.data;
    const [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if(!foundUser){
      return res.status(400).json({ error: 'Invalid verification link', code: 'INVALID_LINK' });
    }

    if(foundUser.emailVerifiedAt){
      return res.status(200).json({ message: 'Your email is already verified. You can log in.', code: 'ALREADY_VERIFIED' });
    }

    if(!foundUser.emailVerificationToken || !foundUser.emailVerificationTokenExpiresAt){
      return res.status(400).json({ error: 'Verification link is invalid or has already been used.', code: 'INVALID_LINK' });
    }

    const providedHash = hashVerificationToken(token);
    const tokenMatches = providedHash === foundUser.emailVerificationToken;
    const notExpired = foundUser.emailVerificationTokenExpiresAt.getTime() > Date.now();

    if(!tokenMatches){
      return res.status(400).json({ error: 'Verification link is invalid.', code: 'INVALID_LINK' });
    }

    if(!notExpired){
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.', code: 'EXPIRED' });
    }

    await db.update(users).set({
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    }).where(eq(users.id, foundUser.id))

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.', code: 'VERIFIED' });
  }
  catch(error){
    console.error('Error verifying email:', error)
    return res.status(500).json({error: 'Internal server error'})
  }
}
export const resendVerification = async (req: Request, res: Response) => {
  const parsed = resendVerificationSchema.safeParse(req.body); 
  if(!parsed.success){
    return res.status(400).json({error: parsed.error.issues[0]?.message ?? 'Invalid input '})
  }
  try{
    const {email} = parsed.data; 
    const [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if(!foundUser || foundUser.emailVerifiedAt){
      return res.status(200).json({message: 'If the account exists, a verification email has been sent. '})

    }
    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(users).set({
      emailVerificationToken: tokenHash,
      emailVerificationTokenExpiresAt: expiresAt,
    }).where(eq(users.id, foundUser.id));

    const verifyLink = buildVerificationLink(foundUser.email, rawToken);
    await sendVerificationEmail(foundUser.email, verifyLink);

    return res.status(200).json({ message: 'If the account exists, a verification email has been sent.' });
  } catch (error) {
    const resendRestriction = getResendRecipientRestrictionMessage(error);
    if (resendRestriction) {
      return res.status(400).json({ error: resendRestriction });
    }
    console.error('Error resending verification email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  
}
export const googleSignIn = async (req: Request, res: Response) => {
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  try {
    let email: string;
    let name: string | undefined;

    if (parsed.data.idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.email_verified) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }
      email = payload.email;
      name = payload.name;
    } else {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${parsed.data.accessToken}` },
      });
      if (!userInfoRes.ok) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }
      const userInfo = await userInfoRes.json() as { email?: string; email_verified?: boolean; name?: string };
      if (!userInfo.email || !userInfo.email_verified) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }
      email = userInfo.email;
      name = userInfo.name;
    }

    let [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!foundUser) {
      [foundUser] = await db.insert(users).values({
        email,
        name: name ?? null,
        username: email.split('@')[0],
        password: null,
        emailVerifiedAt: new Date(), 
        emailVerificationToken: null, 
        emailVerificationTokenExpiresAt: null,
      }).returning();
    }

    if (!foundUser) {
      return res.status(500).json({ error: 'Could not create user' });
    }

    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...user } = foundUser;

    return res.status(200).json({ token, user });
  } catch (error) {
    const uniqueViolation = getUniqueViolation(error);
    if (uniqueViolation) {
      return res.status(409).json({ error: duplicateUserMessage(uniqueViolation.constraint_name) });
    }
    console.error('Error with Google sign-in:', error);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
};
