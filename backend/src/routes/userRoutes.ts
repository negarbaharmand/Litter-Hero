// The Route file just maps the URL to the function in the controller.

import { Router } from 'express';
import { getUser } from '../controllers/userController.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get a user by id or email
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Provide id or email
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/', getUser);

export default router;
