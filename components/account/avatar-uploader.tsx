"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import createClient from "@/utils/supabase/client";
import { updateUserAvatar } from "@/components/account/account-action";
import { getCroppedImg } from "@/utils/image-cropper";
import imageCompression from 'browser-image-compression';

// --- Komponen Utama ---
interface AvatarUploaderProps {
  userId: string;
  onUploadSuccess: (newUrl: string) => void;
  onClose: () => void;
}

const BUCKET_NAME = "profile";

// 2. Definisikan opsi kompresi di luar komponen untuk performa
const compressionOptions = {
  maxSizeMB: 0.5,         // Target maksimal ukuran file 0.5MB
  maxWidthOrHeight: 800,  // Resolusi maksimal 800px
  useWebWorker: true,     // Gunakan web worker agar UI tidak freeze
  initialQuality: 0.8,    // Kualitas awal sebelum iterasi kompresi
};


export function AvatarUploader({ userId, onUploadSuccess, onClose }: AvatarUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (kode fungsi ini tidak berubah)
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
    const toastId = toast.loading("Memproses & mengunggah avatar...");

    try {
      // Langkah A: Dapatkan blob gambar yang sudah dipotong
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Gagal memotong gambar.");
      
      console.log(`Ukuran sebelum kompresi: ${(croppedImageBlob.size / 1024 / 1024).toFixed(2)} MB`);

      // 3. Terapkan kompresi pada blob yang sudah dipotong
      const compressedFile = await imageCompression(
        // Library ini lebih suka menerima object File, kita bisa buat dari Blob
        new File([croppedImageBlob], "avatar.jpg", { type: croppedImageBlob.type }),
        compressionOptions
      );

      console.log(`Ukuran setelah kompresi: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      const fileName = `avatar-${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;

      // 4. Unggah file yang SUDAH DIKOMPRES
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedFile, { // <-- Gunakan compressedFile
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // Buat Signed URL dari bucket privat
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // Expired dalam 10 tahun

      if (urlError) throw urlError;

      const signedUrl = data.signedUrl;

      // Update DB melalui server action dengan Signed URL
      const result = await updateUserAvatar(userId, signedUrl);
      if (result?.error) throw new Error(result.error);

      toast.success("Avatar berhasil diperbarui!", { id: toastId });
      onUploadSuccess(signedUrl);
      onClose();
    } catch (err: unknown) {
      console.error("Upload avatar gagal:", err);
      let errorMessage = "Terjadi kesalahan saat mengunggah.";
      if (err instanceof Error) {
        if ("message" in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Sisa kode JSX tidak ada perubahan
  if (!imageSrc) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Ubah Avatar</DialogTitle>
          <DialogDescription>Pilih gambar persegi untuk avatar Anda.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center w-full py-10">
          <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Klik untuk mengunggah</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, atau WEBP</p>
            </div>
            <input id="avatar-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onFileChange} />
          </label>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sesuaikan Avatar</DialogTitle>
        <DialogDescription>Geser dan perbesar agar wajah Anda terlihat jelas.</DialogDescription>
      </DialogHeader>
      <div className="relative h-72 w-full my-4 bg-muted rounded-md">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
          cropShape="round"
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