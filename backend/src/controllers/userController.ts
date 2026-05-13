import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, reports } from '../db/schema.js';
import { publicUserColumns } from '../db/userPublicColumns.js';
import { count, desc, eq, gte, and } from 'drizzle-orm';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const rawPage = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(100, Math.floor(rawLimit)) : 20;
    const offset = (page - 1) * limit;

    const [countRow] = await db.select({ total: count() }).from(users);
    const total = countRow?.total ?? 0;

    const rows = await db
      .select(publicUserColumns)
      .from(users)
      .orderBy(users.id)
      .limit(limit)
      .offset(offset);

    return res.json({ users: rows, page, limit, total });
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyReports = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.userId, userId),
        gte(reports.createdAt, oneWeekAgo)
      ));

    const weeklyPoints = weeklyReports.length * 10;

    const { password: _, ...userWithoutPassword } = user;

    const badges: string[] = [];
    const reportCount = (user.points ?? 0) / 10;

    if (reportCount >= 1) badges.push('First Report');
    if (reportCount >= 5) badges.push('5 Cleanups');
    if (reportCount >= 10) badges.push('10 Cleanups');
    if (reportCount >= 50) badges.push('50 Cleanups');

    return res.json({
      ...userWithoutPassword,
      weeklyPoints,
      badges,
    });
  } catch (error) {
    console.error('Error fetching me:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [row] = await db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(row);
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};





export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 10;
    const limit = rawLimit === 20 ? 20 : 10;

    const leaderboard = await db
      .select(publicUserColumns)
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);

    return res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
