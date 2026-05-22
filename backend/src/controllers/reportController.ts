import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { eq, sql, and, gt } from 'drizzle-orm';
import { users, reports } from '../db/schema.js';


const maxReportsPerHour = Number(process.env.MAX_REPORTS_PER_HOUR ?? 5)
const minImageBytes = 50 * 1024
const duplicateRadiusMeters = 20;
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
        rejectionReason: reports.rejectionReason,
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
      const { imageUrl, location, description, size, latitude, longitude, imageSizeBytes} = req.body;

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

    const parsedImageSizeBytes = imageSizeBytes === undefined || imageSizeBytes === null || imageSizeBytes === '' ? undefined : Number(imageSizeBytes)
    
    //Image size validation 
    const validImageSize =
      parsedImageSizeBytes !== undefined &&
      Number.isFinite(parsedImageSizeBytes) &&
      parsedImageSizeBytes >= minImageBytes; 
    
    //GPS validation 
    const gpsValid =
      parsedLatitude !== null &&
      parsedLongitude !== null &&
      parsedLatitude !== undefined &&
      parsedLongitude !== undefined &&
      parsedLatitude >= -90 &&
      parsedLatitude <= 90 &&
      parsedLongitude >= -180 &&
      parsedLongitude <= 180;

    //Rejection response 
    const rejectionReasons: string[] = []

    if (!imageUrl) rejectionReasons.push('No image attached')
    if(!gpsValid) rejectionReasons.push('GPS location is missing or invalid')
    if(!validImageSize) rejectionReasons.push('Image file is too small (under 50kb)')
    
    const [rateRow] = await db
      .select({ count: sql<number>`count(*)::int`})
      .from(reports)
      .where(
        and(
          eq(reports.userId, userId),
          gt(reports.createdAt, sql`now() - interval '1 hour'`)
        )
      ); 

      if((rateRow?.count ?? 0) >= maxReportsPerHour){
        rejectionReasons.push('Rate limit exceeded: too many reports this hour')
      }
      //add duplicate check only id GPS is valid 
      if(gpsValid){
        const [duplicate] = await db
        .select({id: reports.id})
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

    if(duplicate) {
      rejectionReasons.push('Duplicate report: same location within 20m already reported');
    }
    
    
    }
    const autoRejected = rejectionReasons.length > 0;
        const [newReport] = await db.insert(reports).values({
            userId,
            imageUrl,
            location,
        latitude: gpsValid? parsedLatitude : null,
        longitude:gpsValid? parsedLongitude: null,
            description,
            size,
            imageSizeBytes: parsedImageSizeBytes ?? null,
            status: autoRejected ? 'rejected' : 'pending',
            rejectionReason:autoRejected? rejectionReasons.join('; ') : null,
        }).returning();
    
    if(!autoRejected){
      await db.update(users).set({
        points: sql`${users.points} + 10`
      }).where(eq(users.id, userId))
    }
      

        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};