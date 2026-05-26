import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { publicUserColumns } from '../db/userPublicColumns.js';

type TokenBody = {
  userId: number;
  email: string;
};

function parseUserId(payload: jwt.JwtPayload): number | undefined {
  const raw = payload.userId;
  if (typeof raw === 'number' && Number.isInteger(raw)) return raw;
  if (typeof raw === 'string') {
    const n = Number(raw);
    if (Number.isInteger(n)) return n;
  }
  return undefined;
}

/**
 * Like `authenticate` but never rejects — sets `req.user` if a valid token is
 * present, otherwise just calls `next()` without a user on the request.
 */
export async function authenticateOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();

  let decoded: jwt.JwtPayload & Partial<TokenBody>;
  try {
    decoded = jwt.verify(token, secret) as jwt.JwtPayload & Partial<TokenBody>;
  } catch {
    return next();
  }

  const userId = parseUserId(decoded);
  if (userId === undefined) return next();

  try {
    const [row] = await db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (row) req.user = row;
  } catch {
    // silently continue without user
  }
  return next();
}

/**
 * Requires `Authorization: Bearer <jwt>`. Verifies the token, loads the user
 * from the DB (without password), and sets `req.user`.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is missing' });
  }

  let decoded: jwt.JwtPayload & Partial<TokenBody>;
  try {
    decoded = jwt.verify(token, secret) as jwt.JwtPayload & Partial<TokenBody>;
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = parseUserId(decoded);
  if (userId === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [row] = await db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = row;
    next();
  } catch (error) {
    console.error('authenticate DB error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
