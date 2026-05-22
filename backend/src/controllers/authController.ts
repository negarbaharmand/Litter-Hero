import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);


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

const googleSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

type PgErrorLike = { code?: string; constraint_name?: string };

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

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is missing' });
  }

  try {
    const { email, password, name, username } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name ?? null,
      username: username ?? null,
    }).returning();

    if (!newUser) {
      return res.status(500).json({ error: 'Could not register user' });
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...user } = newUser;

    return res.status(201).json({ token, user });
  } catch (error) {
    const uniqueViolation = getUniqueViolation(error);
    if (uniqueViolation) {
      return res.status(409).json({ error: duplicateUserMessage(uniqueViolation.constraint_name) });
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

export const googleSignIn = async (req: Request, res: Response) => {
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    let [foundUser] = await db.select().from(users).where(eq(users.email, payload.email)).limit(1);

    if (!foundUser) {
      [foundUser] = await db.insert(users).values({
        email: payload.email,
        name: payload.name ?? null,
        username: payload.email.split('@')[0],
        password: null,
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
