import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';

function getGarageClient(): S3Client {
  const endpoint = process.env.S3_URL;
  const accessKeyId = process.env.access_key_S3;
  const secretAccessKey = process.env.secret_key_S3;
  const region = process.env.S3_REGION ?? 'garage';

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing Garage credentials. Set S3_URL, access_key_S3, and secret_key_S3 in .env'
    );
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    // Required for path-style URLs that Garage uses (e.g. https://garage.example.com/bucket/key)
    forcePathStyle: true,
  });
}

/**
 * Uploads a file buffer to the configured Garage bucket and returns the public URL.
 *
 * @param fileBuffer - Raw file bytes from multer
 * @param originalName - Original filename (used to derive the extension)
 * @param mimeType - MIME type of the file (e.g. "image/jpeg")
 * @returns The full public URL of the uploaded object
 */
export async function uploadImageToGarage(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_URL;

  if (!bucket || !endpoint) {
    throw new Error('S3_BUCKET and S3_URL must be set in .env');
  }

  const ext = path.extname(originalName) || '.jpg';
  const objectKey = `reports/${randomUUID()}${ext}`;

  const client = getGarageClient();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType,
    })
  );

  // Garage serves objects at: <endpoint>/<bucket>/<key>
  return `${endpoint}/${bucket}/${objectKey}`;
}
