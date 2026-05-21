import type { Request, Response } from 'express';
import { uploadImageToGarage } from '../services/garage.js';

/**
 * POST /api/upload
 * Expects multipart/form-data with a single field named "image".
 * Returns { imageUrl: string } on success.
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { buffer, originalname, mimetype } = req.file;

    const imageUrl = await uploadImageToGarage(buffer, originalname, mimetype);

    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image to Garage:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
