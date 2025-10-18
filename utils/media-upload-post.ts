// File: utils/upload-service.ts

import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import type { FilePreview } from "@/hooks/use-multi-file-handler";
// Jika Anda akan menambahkan kompresi, import di sini
import imageCompression from 'browser-image-compression';

// Tipe data output yang diharapkan
interface UploadedMedia {
  media_url: string;
  media_type: 'image' | 'video';
}

// Opsi untuk fungsi upload
interface UploadOptions {
  files: FilePreview[];
  profileId: string | undefined;
  postId: string;
  s3client: S3Client;
  onProgress: (percentage: number) => void;
}

/**
 * Menangani upload beberapa file media ke S3/Supabase Storage,
 * dengan dukungan progress callback dan persiapan untuk kompresi.
 */
export async function uploadMediaFiles({
  files,
  profileId,
  postId,
  s3client,
  onProgress,
}: UploadOptions): Promise<UploadedMedia[]> {
  
  // 1. Hitung total ukuran untuk kalkulasi progress
  const totalSize = files.reduce((acc, p) => acc + p.file.size, 0);
  if (totalSize === 0) return [];

  // Ref lokal untuk melacak progress setiap file
  const progressPerFile = new Array(files.length).fill(0);

  const uploadPromises = files.map(async (preview, index) => {
    let fileToUpload = preview.file;

    // --- TEMPAT UNTUK KOMPRESI DI MASA DEPAN ---
    if (preview.type === 'image') {
      console.log('Mulai kompresi untuk:', fileToUpload.name);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920 };
      const compressedFile = await imageCompression(fileToUpload, options);
      console.log('Kompresi selesai, ukuran baru:', compressedFile.size);
      fileToUpload = compressedFile;
    }
    
    const fileExt = fileToUpload.name.split(".").pop();
    const filePath = `${profileId}/${postId}/${uuidv4()}.${fileExt}`;

    const uploader = new Upload({
      client: s3client,
      params: {
        Bucket: "posts",
        Key: filePath,
        Body: fileToUpload,
        ContentType: fileToUpload.type,
      },
    });

    uploader.on("httpUploadProgress", (progress) => {
      progressPerFile[index] = progress.loaded || 0;
      const totalUploaded = progressPerFile.reduce((acc, loaded) => acc + loaded, 0);
      const percentage = Math.round((totalUploaded / totalSize) * 100);
      onProgress(percentage); // Laporkan progress kembali ke komponen
    });

    await uploader.done();

    return {
      media_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${filePath}`,
      media_type: preview.type,
    };
  });

  return Promise.all(uploadPromises);
}