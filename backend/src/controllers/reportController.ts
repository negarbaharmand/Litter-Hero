import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { eq, sql } from 'drizzle-orm';
import { users, reports } from '../db/schema.js';

// Get all reports
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const allReports = await db.select().from(reports);
    res.json(allReports);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } 
};

// POST a new report
export const createReport = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { imageUrl, location, description, size } = req.body;

        if (!location) {
            return res.status(400).json({ error: 'location is required' });
        }

        const [newReport] = await db.insert(reports).values({
            userId,
            imageUrl,
            location,
            description,
            size
        }).returning();

        await db.update(users).set({
            points: sql`${users.points} + 10`
        }).where(eq(users.id, userId));

        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};