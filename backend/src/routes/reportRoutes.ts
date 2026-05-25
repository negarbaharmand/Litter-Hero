import { Router } from 'express';
import {
  createCleanupSubmission,
  createReport,
  getAllReports,
  getCleanupSubmissionById,
  getReportById,
  voteOnCleanupSubmission,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all reports
 *     description: Returns reports and supports optional status filtering.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, verified, disputed, cleaned, rejected, open, cleanup_pending_vote]
 *         description: Optional status filter
 *     responses:
 *       200:
 *         description: List of all reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get('/', getAllReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get report details
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report details with all cleanup submissions (each includes voteSummary) and winningSubmission when approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportDetails'
 *       400:
 *         description: Invalid report id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get('/:id', getReportById);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     tags: [Reports]
 *     summary: Create a new litter report
 *     description: Creates a report attributed to the authenticated user and adds 10 points to them.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [location]
 *             properties:
 *               location:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               size:
 *                 type: string
 *                 description: e.g. small, medium, large
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: location is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post('/', authenticate, createReport);

/**
 * @swagger
 * /api/reports/{id}/cleanup-submissions:
 *   post:
 *     tags: [Reports]
 *     summary: Submit cleanup proof for a report
 *     description: Creates a cleanup submission (after-photo) and moves report to cleanup_pending_vote when needed.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl:
 *                 type: string
 *               note:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Cleanup submission created
 *       400:
 *         description: Invalid report id or missing imageUrl
 *       401:
 *         description: Missing or invalid JWT
 *       404:
 *         description: Report not found
 *       409:
 *         description: Report already cleaned or duplicate submission by same user
 *       500:
 *         description: Internal server error
 */
router.post('/:id/cleanup-submissions', authenticate, createCleanupSubmission);

/**
 * @swagger
 * /api/reports/{id}/cleanup-submissions/{submissionId}:
 *   get:
 *     tags: [Reports]
 *     summary: Get cleanup submission details and vote summary
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cleanup submission details
 *       400:
 *         description: Invalid report id or submission id
 *       404:
 *         description: Cleanup submission not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/cleanup-submissions/:submissionId', getCleanupSubmissionById);

/**
 * @swagger
 * /api/reports/{id}/cleanup-submissions/{submissionId}/votes:
 *   post:
 *     tags: [Reports]
 *     summary: Vote on a cleanup submission (community verification)
 *     description: |
 *       Cast a community vote on cleanup proof. This is not `/api/reports/{id}/vote` — voting is per cleanup submission.
 *       One vote per user. Submitter and original reporter cannot vote. At 3 votes, majority decides approved/rejected; approved cleanup awards size-based points.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vote]
 *             properties:
 *               vote:
 *                 type: string
 *                 enum: [clean, not_clean]
 *     responses:
 *       201:
 *         description: Vote accepted; submission may still be pending or become approved/rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 voteSummary:
 *                   $ref: '#/components/schemas/VoteSummary'
 *                 submission:
 *                   $ref: '#/components/schemas/CleanupSubmission'
 *       400:
 *         description: Invalid ids or invalid vote value
 *       401:
 *         description: Missing or invalid JWT
 *       403:
 *         description: Forbidden self-vote
 *       404:
 *         description: Cleanup submission not found
 *       409:
 *         description: Duplicate vote, already resolved submission, or already cleaned report
 *       500:
 *         description: Internal server error
 */
router.post('/:id/cleanup-submissions/:submissionId/votes', authenticate, voteOnCleanupSubmission);

export default router;
