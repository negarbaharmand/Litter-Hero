import { Router } from 'express';
import { getAllReports, createReport } from '../controllers/reportController.js';

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all reports
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
 * /api/reports:
 *   post:
 *     tags: [Reports]
 *     summary: Create a new litter report
 *     description: Creates a report and adds 10 points to the given user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, location]
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Author user id
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
 *         description: userId and location are required
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
router.post('/', createReport);

export default router;
