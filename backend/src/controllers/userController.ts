import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { cleanupSubmissions, cleanupSubmissionVotes, reportVerificationVotes, reports, users } from '../db/schema.js';
import { publicUserColumns } from '../db/userPublicColumns.js';
import { count, desc, eq, gte, and, sql, isNotNull } from 'drizzle-orm';
import { calculateWeeklyPoints } from './reportWorkflow.js';
import { getStreakStatsForUser } from '../services/streak.js';

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
      .select({ size: reports.size })
      .from(reports)
      .where(and(
        eq(reports.userId, userId),
        gte(reports.createdAt, oneWeekAgo)
      ));

    const weeklyApprovedCleanups = await db
      .select({ size: reports.size })
      .from(cleanupSubmissions)
      .innerJoin(reports, eq(cleanupSubmissions.reportId, reports.id))
      .where(
        and(
          eq(cleanupSubmissions.userId, userId),
          eq(cleanupSubmissions.status, 'approved'),
          gte(cleanupSubmissions.resolvedAt, oneWeekAgo)
        )
      );

    const [reportsCreatedCount] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.userId, userId));

    const [cleanupsApprovedCount] = await db
      .select({ count: count() })
      .from(cleanupSubmissions)
      .where(
        and(
          eq(cleanupSubmissions.userId, userId),
          eq(cleanupSubmissions.status, 'approved')
        )
      );

    const [cleanupVotesCount] = await db
      .select({ count: count() })
      .from(cleanupSubmissionVotes)
      .where(eq(cleanupSubmissionVotes.userId, userId));

    const [reportVerificationVotesCount] = await db
      .select({ count: count() })
      .from(reportVerificationVotes)
      .where(eq(reportVerificationVotes.userId, userId));

    const weeklyPoints = calculateWeeklyPoints({
      weeklyReportSizes: weeklyReports.map((report) => report.size),
      weeklyApprovedCleanupSizes: weeklyApprovedCleanups.map((cleanup) => cleanup.size),
    });

    const { password: _, ...userWithoutPassword } = user;

    const userPoints = user.points ?? 0;
    const badges: string[] = [];
    const reportCount = reportsCreatedCount?.count ?? 0;
    const cleanupCount = cleanupsApprovedCount?.count ?? 0;
    const reportVerifyCount = reportVerificationVotesCount?.count ?? 0;

    // Badges
    if (reportCount >= 1) badges.push('First Report');
    if (reportCount >= 5) badges.push('5 Reports');
    if (reportCount >= 10) badges.push('10 Reports');
    if (reportCount >= 50) badges.push('50 Reports');

    if (cleanupCount >= 1) badges.push('First Cleanup');
    if (cleanupCount >= 5) badges.push('5 Cleanups');
    if (cleanupCount >= 10) badges.push('10 Cleanups');
    if (cleanupCount >= 50) badges.push('50 Cleanups');

    if (reportVerifyCount >= 1) badges.push('First Verify');
    if (reportVerifyCount >= 10) badges.push('10 Verifications');
    if (reportVerifyCount >= 50) badges.push('50 Verifications');
    if (reportVerifyCount >= 100) badges.push('100 Verifications');

    if (userPoints >= 100) badges.push('Litter Spotter');
    if (userPoints >= 250) badges.push('Street Cleaner');
    if (userPoints >= 500) badges.push('Eco Warrior');
    if (userPoints >= 1000) badges.push('Green Hero');
    if (userPoints >= 2500) badges.push('Beach Hero');
    if (userPoints >= 5000) badges.push('Planet Guardian');

    const { currentStreak, longestStreak, badges: streakBadges, activity } =
      await getStreakStatsForUser(userId);
    badges.push(...streakBadges);

    const totalVerificationVotes = (cleanupVotesCount?.count ?? 0) + reportVerifyCount;

    // Rank = number of users with strictly more points + 1
    const [rankRow] = await db
      .select({ above: count() })
      .from(users)
      .where(sql`${users.points} > ${userPoints}`);
    const rank = (rankRow?.above ?? 0) + 1;

    return res.json({
      ...userWithoutPassword,
      weeklyPoints,
      badges,
      currentStreak,
      longestStreak,
      activity,
      reportsCreated: reportCount,
      cleanupsApproved: cleanupCount,
      reportVerificationVotes: reportVerifyCount,
      verificationVotes: totalVerificationVotes,
      rank,
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
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 100;
    // Tillåter upp till 100 användare för att rank ska stämma för alla
    const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(100, rawLimit) : 100;

    const leaderboard = await db
      .select({
        ...publicUserColumns,
        reportsCreated: sql<number>`(
          SELECT COUNT(*)::int FROM reports
          WHERE reports.user_id = ${sql.raw('"users"."id"')}
        )`,
        cleanupsApproved: sql<number>`(
          SELECT COUNT(*)::int FROM cleanup_submissions
          WHERE user_id = ${sql.raw('"users"."id"')} AND status = 'approved'
        )`,
        reportVerificationVotes: sql<number>`(
          SELECT COUNT(*)::int FROM report_verification_votes
          WHERE user_id = ${sql.raw('"users"."id"')}
        )`,
        verificationVotes: sql<number>`(
          (SELECT COUNT(*)::int FROM cleanup_submission_votes WHERE user_id = ${sql.raw('"users"."id"')}) +
          (SELECT COUNT(*)::int FROM report_verification_votes WHERE user_id = ${sql.raw('"users"."id"')})
        )`,
      })
      .from(users)
      .where(and(isNotNull(users.emailVerifiedAt), isNotNull(users.username)))
      .orderBy(desc(users.points))
      .limit(limit);

    return res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
