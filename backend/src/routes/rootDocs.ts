/**
 * Paths documented here are registered in `index.ts` (not on a Router).
 * This file exists only so swagger-jsdoc picks up the annotations.
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API root
 *     description: Plain-text heartbeat message.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Håll Sverige Rent API is running! 🌍✨
 */

/**
 * @swagger
 * /config-test:
 *   get:
 *     tags: [Health]
 *     summary: Config sanity check
 *     description: Returns whether DATABASE_URL is set (boolean only, not the secret).
 *     responses:
 *       200:
 *         description: Current port and DB env flag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfigTestResponse'
 */

export {};
