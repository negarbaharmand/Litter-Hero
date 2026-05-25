import 'dotenv/config';

import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is required');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(promBundle({
  includeMethod: true,
  includePath: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Håll Sverige Rent API is running! 🌍✨');
});

// Test route to check if .env is working
app.get('/config-test', (req: Request, res: Response) => {
  res.json({
    port: PORT,
    db_connected: !!process.env.DATABASE_URL,
  });
});

// Diagnostic route — checks each table exists and is queryable
app.get('/db-check', async (req: Request, res: Response) => {
  const tables = [
    'users',
    'reports',
    'cleanup_submissions',
    'cleanup_submission_votes',
    'report_verification_votes',
  ];
  const results: Record<string, { ok: boolean; error?: string }> = {};
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`SELECT 1 FROM "${table}" LIMIT 1`));
      results[table] = { ok: true };
    } catch (e: unknown) {
      results[table] = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  const allOk = Object.values(results).every((r) => r.ok);
  return res.status(allOk ? 200 : 500).json({ allOk, tables: results });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
