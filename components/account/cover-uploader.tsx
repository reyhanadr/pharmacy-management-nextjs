"use client";

import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';
import createClient from '@/utils/supabase/client';
import { updateUserCover } from '@/components/account/account-action';
import { getCroppedImg } from '@/utils/image-cropper';
// 1. Import library kompresi
import imageCompression from 'browser-image-compression';

interface CoverUploaderProps {
  userId: string;
  onUploadSuccess: (newUrl: string) => void;
  onClose: () => void;
}

// 2. Gunakan konstanta bucket yang sama
const BUCKET_NAME = "profile";

// 3. Opsi kompresi untuk cover, bisa sedikit lebih besar dari avatar
const compressionOptions = {
  maxSizeMB: 1,           // Target 1MB, karena cover lebih besar
  maxWidthOrHeight: 1920,   // Resolusi Full HD untuk kualitas yang baik
  useWebWorker: true,
};

export function CoverUploader({ userId, onUploadSuccess, onClose }: CoverUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diizinkan.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImageSrc(reader.result as string);
      reader.onerror = () => toast.error("Gagal membaca file gambar.");
    }
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleUpload = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    if (!userId) {
      toast.error("Sesi pengguna tidak valid. Silakan muat ulang halaman.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Memproses & mengunggah foto sampul...');

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error('Gagal memotong gambar.');

      // 4. Terapkan kompresi pada gambar yang sudah dipotong
      const compressedFile = await imageCompression(
        new File([croppedImageBlob], "cover.jpg", { type: croppedImageBlob.type }),
        compressionOptions
      );

      // 5. Sesuaikan nama file dan path
      const fileName = `cover-${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;

      // 6. Unggah file yang SUDAH DIKOMPRES ke bucket 'profile'
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 7. Buat Signed URL dari bucket privat
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // Expired dalam 10 tahun

      if (urlError) throw urlError;

      const signedUrl = data.signedUrl;

      // 8. Simpan URL ke database via Server Action
      const result = await updateUserCover(userId, signedUrl);
      if (result?.error) throw new Error(result.error);

      toast.success('Foto sampul berhasil diperbarui!', { id: toastId });
      onUploadSuccess(signedUrl);
      onClose();

    } catch (error: unknown) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Sisa kode JSX tidak berubah
  if (!imageSrc) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Ubah Foto Sampul</DialogTitle>
          <DialogDescription>Pilih gambar dari perangkat Anda.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center w-full py-10">
          <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Klik untuk mengunggah</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, atau WEBP</p>
            </div>
            <input id="cover-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onFileChange} />
          </label>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sesuaikan Foto Sampul</DialogTitle>
        <DialogDescription>Geser dan perbesar gambar agar pas.</DialogDescription>
      </DialogHeader>
      <div className="relative h-64 w-full my-4 bg-muted rounded-md">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 6} // Rasio aspek untuk foto sampul tetap dipertahankan
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="zoom" className="text-sm">Perbesar</label>
        <Slider
          id="zoom"
          min={1}
          max={3}
          step={0.1}
          value={[zoom]}
          onValueChange={(val) => setZoom(val[0])}
          disabled={isUploading}
        />
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={() => setImageSrc(null)} disabled={isUploading}>
          Ganti Gambar
        </Button>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan & Unggah
        </Button>
      </DialogFooter>
    </>
  );
}