import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { and, eq, gt, inArray, ne, notExists, sql } from 'drizzle-orm';
import { cleanupSubmissions, cleanupSubmissionVotes, reportVerificationVotes, reports, users } from '../db/schema.js';
import {
  CLEANUP_VOTE_THRESHOLD,
  getCleanupPointsForSize,
  getReportPointsForSize,
  REPORT_VERIFICATION_VOTER_POINTS,
  REPORT_VOTE_THRESHOLD,
  resolveCleanupFromVotes,
  resolveReportFromVotes,
  summarizeReportVotes,
  summarizeVotes,
} from './reportWorkflow.js';

const DB_REPORT_STATUSES = new Set([
  'pending',
  'verified',
  'disputed',
  'cleaned',
  'rejected',
  'open',
  'cleanup_pending_vote',
]);

// Virtual filter combining pending + cleanup_pending_vote — not a real DB status
const VIRTUAL_STATUS_FILTERS = new Set(['needs_votes']);

const REPORT_STATUSES = new Set([...DB_REPORT_STATUSES, ...VIRTUAL_STATUS_FILTERS]);

function parsePositiveId(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

async function getVoteSummary(submissionId: number, currentUserId?: number) {
  const votes = await db
    .select({
      vote: cleanupSubmissionVotes.vote,
      userId: cleanupSubmissionVotes.userId,
    })
    .from(cleanupSubmissionVotes)
    .where(eq(cleanupSubmissionVotes.submissionId, submissionId));

  const { cleanVotes, notCleanVotes } = summarizeVotes(votes.map((v) => v.vote));

  return {
    totalVotes: votes.length,
    cleanVotes,
    notCleanVotes,
    myVote:
      currentUserId === undefined
        ? null
        : votes.find((v) => v.userId === currentUserId)?.vote ?? null,
  };
}

async function getReportVerificationVoteSummary(reportId: number, currentUserId?: number) {
  const votes = await db
    .select({
      vote: reportVerificationVotes.vote,
      userId: reportVerificationVotes.userId,
    })
    .from(reportVerificationVotes)
    .where(eq(reportVerificationVotes.reportId, reportId));

  const { legitVotes, notTrashVotes } = summarizeReportVotes(votes.map((v) => v.vote));

  return {
    totalVotes: votes.length,
    legitVotes,
    notTrashVotes,
    myVote:
      currentUserId === undefined
        ? null
        : votes.find((v) => v.userId === currentUserId)?.vote ?? null,
  };
}

const maxReportsPerHour = Number(process.env.MAX_REPORTS_PER_HOUR ?? 5);
const minImageBytes = 50 * 1024;
const duplicateRadiusMeters = 20;

// Get all reports
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
    if (statusFilter && !REPORT_STATUSES.has(statusFilter)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const query = db
      .select({
        id: reports.id,
        userId: reports.userId,
        imageUrl: reports.imageUrl,
        location: reports.location,
        latitude: reports.latitude,
        longitude: reports.longitude,
        description: reports.description,
        size: reports.size,
        status: reports.status,
        cleanedByUserId: reports.cleanedByUserId,
        cleanedAt: reports.cleanedAt,
        rejectionReason: reports.rejectionReason,
        createdAt: reports.createdAt,
        pendingSubmissionsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM cleanup_submissions cs
          WHERE cs.report_id = ${sql.raw('"reports"."id"')}
            AND cs.status = 'pending'
        )`,
        topPendingVoteCount: sql<number>`(
          SELECT COALESCE(MAX(vote_counts.cnt), 0)
          FROM (
            SELECT COUNT(*)::int AS cnt
            FROM cleanup_submission_votes csv
            INNER JOIN cleanup_submissions cs ON cs.id = csv.submission_id
            WHERE cs.report_id = ${sql.raw('"reports"."id"')}
              AND cs.status = 'pending'
            GROUP BY csv.submission_id
          ) AS vote_counts
        )`,
        reportVerificationVoteCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM report_verification_votes rvv
          WHERE rvv.report_id = ${sql.raw('"reports"."id"')}
        )`,
      })
      .from(reports);

    const allReports = statusFilter === 'needs_votes'
      ? await query.where(inArray(reports.status, ['pending', 'cleanup_pending_vote']))
      : statusFilter
        ? await query.where(eq(reports.status, statusFilter as (typeof reports.$inferSelect)['status']))
        : await query;

    return res.json(allReports);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const reportId = parsePositiveId(req.params.id);
    if (!reportId) return res.status(400).json({ error: 'Invalid report id' });

    const [report] = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        imageUrl: reports.imageUrl,
        location: reports.location,
        latitude: reports.latitude,
        longitude: reports.longitude,
        description: reports.description,
        size: reports.size,
        status: reports.status,
        cleanedByUserId: reports.cleanedByUserId,
        cleanedAt: reports.cleanedAt,
        rejectionReason: reports.rejectionReason,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) return res.status(404).json({ error: 'Report not found' });

    const submissions = await db
      .select({
        id: cleanupSubmissions.id,
        reportId: cleanupSubmissions.reportId,
        userId: cleanupSubmissions.userId,
        imageUrl: cleanupSubmissions.imageUrl,
        note: cleanupSubmissions.note,
        status: cleanupSubmissions.status,
        createdAt: cleanupSubmissions.createdAt,
        resolvedAt: cleanupSubmissions.resolvedAt,
      })
      .from(cleanupSubmissions)
      .where(eq(cleanupSubmissions.reportId, reportId));

    const cleanupSubmissionsWithVotes = await Promise.all(
      submissions.map(async (submission) => ({
        ...submission,
        voteSummary: await getVoteSummary(submission.id, req.user?.id),
      }))
    );

    const winningSubmission =
      cleanupSubmissionsWithVotes.find((submission) => submission.status === 'approved') ?? null;

    const verificationVoteSummary = await getReportVerificationVoteSummary(reportId, req.user?.id);

    return res.json({
      ...report,
      verificationVoteSummary,
      winningSubmission,
      cleanupSubmissions: cleanupSubmissionsWithVotes,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST a new report
export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { imageUrl, location, description, size, latitude, longitude, imageSizeBytes } =
      req.body;

    const parseNullableReal = (value: unknown): number | null | undefined => {
      if (value === undefined) return undefined;
      if (value === null || value === '') return null;

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parsedLatitude = parseNullableReal(latitude);
    const parsedLongitude = parseNullableReal(longitude);

    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    if (latitude !== undefined && parsedLatitude === undefined) {
      return res.status(400).json({ error: 'latitude must be a valid number' });
    }

    if (longitude !== undefined && parsedLongitude === undefined) {
      return res.status(400).json({ error: 'longitude must be a valid number' });
    }

    const parsedImageSizeBytes =
      imageSizeBytes === undefined || imageSizeBytes === null || imageSizeBytes === ''
        ? undefined
        : Number(imageSizeBytes);

    const validImageSize =
      parsedImageSizeBytes !== undefined &&
      Number.isFinite(parsedImageSizeBytes) &&
      parsedImageSizeBytes >= minImageBytes;

    const gpsValid =
      parsedLatitude !== null &&
      parsedLongitude !== null &&
      parsedLatitude !== undefined &&
      parsedLongitude !== undefined &&
      parsedLatitude >= -90 &&
      parsedLatitude <= 90 &&
      parsedLongitude >= -180 &&
      parsedLongitude <= 180;

    const rejectionReasons: string[] = [];

    if (!imageUrl) rejectionReasons.push('No image attached');
    if (!gpsValid) rejectionReasons.push('GPS location is missing or invalid');
    if (!validImageSize) rejectionReasons.push('Image file is too small (under 50kb)');

    const [rateRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(
        and(eq(reports.userId, userId), gt(reports.createdAt, sql`now() - interval '1 hour'`))
      );

    if ((rateRow?.count ?? 0) >= maxReportsPerHour) {
      rejectionReasons.push('Rate limit exceeded: too many reports this hour');
    }

    if (gpsValid) {
      const [duplicate] = await db
        .select({ id: reports.id })
        .from(reports)
        .where(sql`
      ${reports.latitude} IS NOT NULL
      AND ${reports.longitude} IS NOT NULL
      AND ${reports.status} <> 'rejected'
      AND (
        6371000 * acos(
          least(
            1,
            greatest(
              -1,
              cos(radians(${parsedLatitude})) * cos(radians(${reports.latitude})) *
              cos(radians(${reports.longitude}) - radians(${parsedLongitude})) +
              sin(radians(${parsedLatitude})) * sin(radians(${reports.latitude}))
            )
          )
        )
      ) <= ${duplicateRadiusMeters}
    `)
        .limit(1);

      if (duplicate) {
        rejectionReasons.push(
          'Duplicate report: same location within 20m already reported'
        );
      }
    }

    const autoRejected = rejectionReasons.length > 0;

    const [newReport] = await db
      .insert(reports)
      .values({
        userId,
        imageUrl,
        location,
        latitude: gpsValid ? parsedLatitude : null,
        longitude: gpsValid ? parsedLongitude : null,
        description,
        size,
        imageSizeBytes: parsedImageSizeBytes ?? null,
        status: autoRejected ? 'rejected' : 'pending',
        rejectionReason: autoRejected ? rejectionReasons.join('; ') : null,
      })
      .returning();

    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCleanupSubmission = async (req: Request, res: Response) => {
  try {
    const reportId = parsePositiveId(req.params.id);
    if (!reportId) return res.status(400).json({ error: 'Invalid report id' });

    const userId = req.user!.id;
    const { imageUrl, note } = req.body as { imageUrl?: unknown; note?: unknown };

    if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const [report] = await db
      .select({
        id: reports.id,
        status: reports.status,
      })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.status === 'cleaned') {
      return res.status(409).json({ error: 'Report is already cleaned' });
    }
    if (report.status === 'rejected') {
      return res.status(409).json({ error: 'Report has been rejected' });
    }

    const [createdSubmission] = await db
      .insert(cleanupSubmissions)
      .values({
        reportId,
        userId,
        imageUrl: imageUrl.trim(),
        note: typeof note === 'string' && note.trim().length > 0 ? note.trim() : null,
      })
      .returning({
        id: cleanupSubmissions.id,
        reportId: cleanupSubmissions.reportId,
        userId: cleanupSubmissions.userId,
        imageUrl: cleanupSubmissions.imageUrl,
        note: cleanupSubmissions.note,
        status: cleanupSubmissions.status,
        createdAt: cleanupSubmissions.createdAt,
        resolvedAt: cleanupSubmissions.resolvedAt,
      });

    // Cleanup proof on a pending report bypasses verification — the physical
    // act of cleaning is stronger evidence than 3 remote votes.
    if (report.status === 'pending' || report.status === 'verified' || report.status === 'open') {
      await db
        .update(reports)
        .set({ status: 'cleanup_pending_vote' })
        .where(and(eq(reports.id, reportId), eq(reports.status, report.status)));
    }

    return res.status(201).json({
      ...createdSubmission,
      voteSummary: {
        totalVotes: 0,
        cleanVotes: 0,
        notCleanVotes: 0,
        myVote: null,
      },
    });
  } catch (error) {
    const maybePgError = error as { code?: string };
    if (maybePgError.code === '23505') {
      return res
        .status(409)
        .json({ error: 'You already submitted a cleanup for this report' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCleanupSubmissionById = async (req: Request, res: Response) => {
  try {
    const reportId = parsePositiveId(req.params.id);
    const submissionId = parsePositiveId(req.params.submissionId);
    if (!reportId) return res.status(400).json({ error: 'Invalid report id' });
    if (!submissionId) return res.status(400).json({ error: 'Invalid submission id' });

    const [submission] = await db
      .select({
        id: cleanupSubmissions.id,
        reportId: cleanupSubmissions.reportId,
        userId: cleanupSubmissions.userId,
        imageUrl: cleanupSubmissions.imageUrl,
        note: cleanupSubmissions.note,
        status: cleanupSubmissions.status,
        createdAt: cleanupSubmissions.createdAt,
        resolvedAt: cleanupSubmissions.resolvedAt,
      })
      .from(cleanupSubmissions)
      .where(and(eq(cleanupSubmissions.id, submissionId), eq(cleanupSubmissions.reportId, reportId)))
      .limit(1);

    if (!submission) return res.status(404).json({ error: 'Cleanup submission not found' });

    const voteSummary = await getVoteSummary(submissionId, req.user?.id);
    return res.json({
      ...submission,
      voteSummary,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const voteOnCleanupSubmission = async (req: Request, res: Response) => {
  try {
    const reportId = parsePositiveId(req.params.id);
    const submissionId = parsePositiveId(req.params.submissionId);
    if (!reportId) return res.status(400).json({ error: 'Invalid report id' });
    if (!submissionId) return res.status(400).json({ error: 'Invalid submission id' });

    const userId = req.user!.id;
    const vote = req.body?.vote;
    if (vote !== 'clean' && vote !== 'not_clean') {
      return res.status(400).json({ error: "vote must be either 'clean' or 'not_clean'" });
    }

    const outcome = await db.transaction(async (tx) => {
      const [submissionWithReport] = await tx
        .select({
          submissionId: cleanupSubmissions.id,
          submissionStatus: cleanupSubmissions.status,
          submitterUserId: cleanupSubmissions.userId,
          reportId: cleanupSubmissions.reportId,
          reportStatus: reports.status,
          reportOwnerUserId: reports.userId,
          reportSize: reports.size,
        })
        .from(cleanupSubmissions)
        .innerJoin(reports, eq(cleanupSubmissions.reportId, reports.id))
        .where(
          and(eq(cleanupSubmissions.id, submissionId), eq(cleanupSubmissions.reportId, reportId))
        )
        .limit(1);

      if (!submissionWithReport) {
        return { type: 'not_found' } as const;
      }

      if (submissionWithReport.submissionStatus !== 'pending') {
        return { type: 'already_resolved' } as const;
      }

      if (submissionWithReport.reportStatus === 'cleaned') {
        return { type: 'already_cleaned' } as const;
      }

      if (userId === submissionWithReport.submitterUserId) {
        return { type: 'forbidden_self_vote' } as const;
      }

      try {
        await tx
          .insert(cleanupSubmissionVotes)
          .values({
            submissionId,
            userId,
            vote,
          })
          .onConflictDoNothing({
            target: [cleanupSubmissionVotes.submissionId, cleanupSubmissionVotes.userId],
          });
      } catch (error) {
        throw error;
      }

      const votes = await tx
        .select({ vote: cleanupSubmissionVotes.vote })
        .from(cleanupSubmissionVotes)
        .where(eq(cleanupSubmissionVotes.submissionId, submissionId));

      const voteSummary = summarizeVotes(votes.map((v) => v.vote));
      const { cleanVotes, notCleanVotes, totalVotes } = voteSummary;

      if (totalVotes < CLEANUP_VOTE_THRESHOLD) {
        return {
          type: 'pending',
          voteSummary: {
            totalVotes,
            cleanVotes,
            notCleanVotes,
            myVote: vote,
          },
        } as const;
      }

      const now = new Date();
      const finalStatus = resolveCleanupFromVotes(votes.map((v) => v.vote));
      if (finalStatus === 'pending') {
        return {
          type: 'pending',
          voteSummary: {
            totalVotes,
            cleanVotes,
            notCleanVotes,
            myVote: vote,
          },
        } as const;
      }

      const [resolvedSubmission] = await tx
        .update(cleanupSubmissions)
        .set({
          status: finalStatus,
          resolvedAt: now,
        })
        .where(and(eq(cleanupSubmissions.id, submissionId), eq(cleanupSubmissions.status, 'pending')))
        .returning({
          id: cleanupSubmissions.id,
          reportId: cleanupSubmissions.reportId,
          userId: cleanupSubmissions.userId,
          imageUrl: cleanupSubmissions.imageUrl,
          note: cleanupSubmissions.note,
          status: cleanupSubmissions.status,
          createdAt: cleanupSubmissions.createdAt,
          resolvedAt: cleanupSubmissions.resolvedAt,
        });

      if (!resolvedSubmission) {
        return { type: 'already_resolved' } as const;
      }

      if (finalStatus === 'approved') {
        const [updatedReport] = await tx
          .update(reports)
          .set({
            status: 'cleaned',
            cleanedByUserId: submissionWithReport.submitterUserId,
            cleanedAt: now,
          })
          .where(and(eq(reports.id, reportId), ne(reports.status, 'cleaned')))
          .returning({ id: reports.id, status: reports.status });

        if (!updatedReport) {
          return { type: 'already_cleaned' } as const;
        }

        await tx
          .update(users)
          .set({
            points: sql`${users.points} + ${getCleanupPointsForSize(submissionWithReport.reportSize)}`,
          })
          .where(eq(users.id, submissionWithReport.submitterUserId));

        await tx
          .update(cleanupSubmissions)
          .set({
            status: 'expired',
            resolvedAt: now,
          })
          .where(
            and(
              eq(cleanupSubmissions.reportId, reportId),
              ne(cleanupSubmissions.id, submissionId),
              eq(cleanupSubmissions.status, 'pending')
            )
          );
      } else {
        const [pendingSubmissionCount] = await tx
          .select({
            count: sql<number>`count(*)::int`,
          })
          .from(cleanupSubmissions)
          .where(
            and(eq(cleanupSubmissions.reportId, reportId), eq(cleanupSubmissions.status, 'pending'))
          );

        if ((pendingSubmissionCount?.count ?? 0) === 0) {
          await tx
            .update(reports)
            .set({ status: 'verified' })
            .where(and(eq(reports.id, reportId), eq(reports.status, 'cleanup_pending_vote')));
        }
      }

      return {
        type: 'resolved',
        submission: resolvedSubmission,
        voteSummary: {
          totalVotes,
          cleanVotes,
          notCleanVotes,
          myVote: vote,
        },
      } as const;
    });

    switch (outcome.type) {
      case 'not_found':
        return res.status(404).json({ error: 'Cleanup submission not found' });
      case 'already_resolved':
        return res.status(409).json({ error: 'Cleanup submission is already resolved' });
      case 'already_cleaned':
        return res.status(409).json({ error: 'Report is already cleaned' });
      case 'forbidden_self_vote':
        return res.status(403).json({ error: 'You cannot vote on your own report or cleanup' });
      case 'pending':
        return res.status(201).json({
          status: 'pending',
          voteSummary: outcome.voteSummary,
        });
      case 'resolved':
        return res.status(201).json({
          status: outcome.submission.status,
          submission: outcome.submission,
          voteSummary: outcome.voteSummary,
        });
      default:
        return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const voteOnReportVerification = async (req: Request, res: Response) => {
  try {
    const reportId = parsePositiveId(req.params.id);
    if (!reportId) return res.status(400).json({ error: 'Invalid report id' });

    const userId = req.user!.id;
    const vote = req.body?.vote;
    if (vote !== 'legit' && vote !== 'not_trash') {
      return res.status(400).json({ error: "vote must be either 'legit' or 'not_trash'" });
    }

    const outcome = await db.transaction(async (tx) => {
      const [report] = await tx
        .select({
          id: reports.id,
          status: reports.status,
          userId: reports.userId,
          size: reports.size,
        })
        .from(reports)
        .where(eq(reports.id, reportId))
        .limit(1);

      if (!report) return { type: 'not_found' } as const;
      if (report.status !== 'pending') return { type: 'not_pending' } as const;
      if (report.userId === userId) return { type: 'forbidden_self_vote' } as const;

      try {
        await tx.insert(reportVerificationVotes).values({ reportId, userId, vote });
      } catch (error) {
        const maybePgError = error as { code?: string };
        if (maybePgError.code === '23505') return { type: 'duplicate_vote' } as const;
        throw error;
      }

      await tx
        .update(users)
        .set({ points: sql`${users.points} + ${REPORT_VERIFICATION_VOTER_POINTS}` })
        .where(eq(users.id, userId));

      const allVotes = await tx
        .select({ vote: reportVerificationVotes.vote })
        .from(reportVerificationVotes)
        .where(eq(reportVerificationVotes.reportId, reportId));

      const { totalVotes, legitVotes, notTrashVotes } = summarizeReportVotes(allVotes.map((v) => v.vote));

      if (totalVotes < REPORT_VOTE_THRESHOLD) {
        return {
          type: 'pending',
          voteSummary: { totalVotes, legitVotes, notTrashVotes, myVote: vote },
        } as const;
      }

      const resolution = resolveReportFromVotes(allVotes.map((v) => v.vote));
      if (resolution === 'pending') {
        return {
          type: 'pending',
          voteSummary: { totalVotes, legitVotes, notTrashVotes, myVote: vote },
        } as const;
      }

      await tx
        .update(reports)
        .set({
          status: resolution,
          rejectionReason: resolution === 'rejected' ? 'Community verification failed' : null,
        })
        .where(and(eq(reports.id, reportId), eq(reports.status, 'pending')));

      if (resolution === 'verified') {
        await tx
          .update(users)
          .set({ points: sql`${users.points} + ${getReportPointsForSize(report.size)}` })
          .where(eq(users.id, report.userId));
      }

      return {
        type: 'resolved',
        resolution,
        voteSummary: { totalVotes, legitVotes, notTrashVotes, myVote: vote },
      } as const;
    });

    switch (outcome.type) {
      case 'not_found':
        return res.status(404).json({ error: 'Report not found' });
      case 'not_pending':
        return res.status(409).json({ error: 'Report is not pending verification' });
      case 'forbidden_self_vote':
        return res.status(403).json({ error: 'You cannot vote on your own report' });
      case 'duplicate_vote':
        return res.status(409).json({ error: 'You have already voted on this report' });
      case 'pending':
        return res.status(201).json({ status: 'pending', voteSummary: outcome.voteSummary });
      case 'resolved':
        return res.status(201).json({ status: outcome.resolution, voteSummary: outcome.voteSummary });
      default:
        return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVoteQueue = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    // --- Trash verifications: pending reports user can still vote on ---
    const trashConditions = [eq(reports.status, 'pending')];
    if (currentUserId) {
      trashConditions.push(ne(reports.userId, currentUserId));
      trashConditions.push(
        notExists(
          db.select({ _: sql`1` })
            .from(reportVerificationVotes)
            .where(
              and(
                eq(reportVerificationVotes.reportId, reports.id),
                eq(reportVerificationVotes.userId, currentUserId)
              )
            )
        )
      );
    }

    const trashRows = await db
      .select({
        reportId: reports.id,
        location: reports.location,
        description: reports.description,
        imageUrl: reports.imageUrl,
        ownerUserId: reports.userId,
        size: reports.size,
        createdAt: reports.createdAt,
        totalVotes: sql<number>`(SELECT COUNT(*)::int FROM report_verification_votes rvv WHERE rvv.report_id = ${sql.raw('"reports"."id"')})`,
        legitVotes: sql<number>`(SELECT COUNT(*)::int FROM report_verification_votes rvv WHERE rvv.report_id = ${sql.raw('"reports"."id"')} AND rvv.vote = 'legit')`,
        notTrashVotes: sql<number>`(SELECT COUNT(*)::int FROM report_verification_votes rvv WHERE rvv.report_id = ${sql.raw('"reports"."id"')} AND rvv.vote = 'not_trash')`,
        myVote: currentUserId
          ? sql<'legit' | 'not_trash' | null>`(SELECT rvv.vote FROM report_verification_votes rvv WHERE rvv.report_id = ${sql.raw('"reports"."id"')} AND rvv.user_id = ${currentUserId} LIMIT 1)`
          : sql<null>`NULL`,
      })
      .from(reports)
      .where(and(...trashConditions))
      .orderBy(reports.createdAt);

    // --- Cleanup verifications: pending submissions on cleanup_pending_vote reports ---
    const cleanupConditions = [
      eq(cleanupSubmissions.status, 'pending'),
      eq(reports.status, 'cleanup_pending_vote'),
    ];
    if (currentUserId) {
      cleanupConditions.push(ne(cleanupSubmissions.userId, currentUserId));
      cleanupConditions.push(
        notExists(
          db.select({ _: sql`1` })
            .from(cleanupSubmissionVotes)
            .where(
              and(
                eq(cleanupSubmissionVotes.submissionId, cleanupSubmissions.id),
                eq(cleanupSubmissionVotes.userId, currentUserId)
              )
            )
        )
      );
    }

    const cleanupRows = await db
      .select({
        reportId: reports.id,
        reportLocation: reports.location,
        reportOwnerUserId: reports.userId,
        submissionId: cleanupSubmissions.id,
        submissionUserId: cleanupSubmissions.userId,
        imageUrl: cleanupSubmissions.imageUrl,
        note: cleanupSubmissions.note,
        submissionStatus: cleanupSubmissions.status,
        submissionCreatedAt: cleanupSubmissions.createdAt,
        submissionResolvedAt: cleanupSubmissions.resolvedAt,
        totalVotes: sql<number>`(SELECT COUNT(*)::int FROM cleanup_submission_votes csv WHERE csv.submission_id = ${sql.raw('"cleanup_submissions"."id"')})`,
        cleanVotes: sql<number>`(SELECT COUNT(*)::int FROM cleanup_submission_votes csv WHERE csv.submission_id = ${sql.raw('"cleanup_submissions"."id"')} AND csv.vote = 'clean')`,
        notCleanVotes: sql<number>`(SELECT COUNT(*)::int FROM cleanup_submission_votes csv WHERE csv.submission_id = ${sql.raw('"cleanup_submissions"."id"')} AND csv.vote = 'not_clean')`,
        myVote: currentUserId
          ? sql<'clean' | 'not_clean' | null>`(SELECT csv.vote FROM cleanup_submission_votes csv WHERE csv.submission_id = ${sql.raw('"cleanup_submissions"."id"')} AND csv.user_id = ${currentUserId} LIMIT 1)`
          : sql<null>`NULL`,
      })
      .from(cleanupSubmissions)
      .innerJoin(reports, eq(cleanupSubmissions.reportId, reports.id))
      .where(and(...cleanupConditions))
      .orderBy(cleanupSubmissions.createdAt);

    return res.json({
      trashVerifications: trashRows.map((r) => ({
        reportId: r.reportId,
        location: r.location,
        description: r.description,
        imageUrl: r.imageUrl,
        ownerUserId: r.ownerUserId,
        size: r.size,
        createdAt: r.createdAt,
        voteSummary: {
          totalVotes: r.totalVotes,
          legitVotes: r.legitVotes,
          notTrashVotes: r.notTrashVotes,
          myVote: r.myVote ?? null,
        },
      })),
      cleanupVerifications: cleanupRows.map((c) => ({
        reportId: c.reportId,
        reportLocation: c.reportLocation,
        reportOwnerUserId: c.reportOwnerUserId,
        submission: {
          id: c.submissionId,
          reportId: c.reportId,
          userId: c.submissionUserId,
          imageUrl: c.imageUrl,
          note: c.note,
          status: c.submissionStatus,
          createdAt: c.submissionCreatedAt,
          resolvedAt: c.submissionResolvedAt,
          voteSummary: {
            totalVotes: c.totalVotes,
            cleanVotes: c.cleanVotes,
            notCleanVotes: c.notCleanVotes,
            myVote: c.myVote ?? null,
          },
        },
      })),
    });
  } catch (error) {
    console.error('getVoteQueue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};