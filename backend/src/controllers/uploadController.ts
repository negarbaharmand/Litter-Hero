import type { Request, Response } from 'express';
import { uploadImageToGarage } from '../services/garage.js';
type UploadRequest = Request & {
  file?: {
    buffer: Buffer;
    originalname: string; 
    mimetype: string; 
    size: number;
  }
}
/**
 * POST /api/upload
 * Expects multipart/form-data with a single field named "image".
 * Returns { imageUrl: string } on success.
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { file } = req as UploadRequest;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { buffer, originalname, mimetype, size } = file;

    const imageUrl = await uploadImageToGarage(buffer, originalname, mimetype);

    return res.status(201).json({ imageUrl, imageSizeBytes: size});
  } catch (error) {
    console.error('Error uploading image to Garage:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
};
