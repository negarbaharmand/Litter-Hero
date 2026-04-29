import { Router } from 'express';
import { getAllReports, createReport } from '../controllers/reportController.js';

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     responses:
 *       200:
 *         description: List of all reports
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllReports);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new litter report
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
 *               location:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               size:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: userId and location are required
 *       500:
 *         description: Internal server error
 */
router.post('/', createReport);

export default router;