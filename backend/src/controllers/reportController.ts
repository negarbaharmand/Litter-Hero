import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { eq, sql } from 'drizzle-orm';
import { users, reports } from '../db/schema.js';

// Get all reports
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const allReports = await db
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
        createdAt: reports.createdAt,
      })
      .from(reports);
    res.json(allReports);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } 
};

// POST a new report
export const createReport = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
    const { imageUrl, location, description, size, latitude, longitude } = req.body;

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

        const [newReport] = await db.insert(reports).values({
            userId,
            imageUrl,
            location,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
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