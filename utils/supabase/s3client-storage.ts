import { S3Client } from '@aws-sdk/client-s3';

export const s3client = new S3Client({
  forcePathStyle: true,
  region: process.env.NEXT_PUBLIC_SUPABASE_REGION!,
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT_STORAGE!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_ACCESS_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_SECRET_ACCESS_KEY!,
  }
})