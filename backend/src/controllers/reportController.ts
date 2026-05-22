import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { and, eq, gt, ne, sql } from 'drizzle-orm';
import { cleanupSubmissions, cleanupSubmissionVotes, reports, users } from '../db/schema.js';
import {
  CLEANUP_VOTE_THRESHOLD,
  getCleanupPointsForSize,
  getReportPointsForSize,
  resolveCleanupFromVotes,
  summarizeVotes,
} from './reportWorkflow.js';

const REPORT_STATUSES = new Set([
  'pending',
  'verified',
  'disputed',
  'cleaned',
  'rejected',
  'open',
  'cleanup_pending_vote',
]);

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

  const cleanVotes = votes.filter((vote) => vote.vote === 'clean').length;
  const notCleanVotes = votes.filter((vote) => vote.vote === 'not_clean').length;

  return {
    totalVotes: votes.length,
    cleanVotes,
    notCleanVotes,
    myVote:
      currentUserId === undefined
        ? null
        : votes.find((vote) => vote.userId === currentUserId)?.vote ?? null,
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
      })
      .from(reports);

    const allReports = statusFilter
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

    return res.json({
      ...report,
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
        status: autoRejected ? 'rejected' : 'open',
        rejectionReason: autoRejected ? rejectionReasons.join('; ') : null,
      })
      .returning();

    if (!autoRejected) {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${getReportPointsForSize(size)}`,
        })
        .where(eq(users.id, userId));
    }

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

    if (report.status === 'open') {
      await db
        .update(reports)
        .set({ status: 'cleanup_pending_vote' })
        .where(and(eq(reports.id, reportId), eq(reports.status, 'open')));
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

      if (
        userId === submissionWithReport.submitterUserId ||
        userId === submissionWithReport.reportOwnerUserId
      ) {
        return { type: 'forbidden_self_vote' } as const;
      }

      try {
        await tx.insert(cleanupSubmissionVotes).values({
          submissionId,
          userId,
          vote,
        });
      } catch (error) {
        const maybePgError = error as { code?: string };
        if (maybePgError.code === '23505') {
          return { type: 'duplicate_vote' } as const;
        }
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
            .set({ status: 'open' })
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
      case 'duplicate_vote':
        return res.status(409).json({ error: 'You have already voted on this submission' });
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