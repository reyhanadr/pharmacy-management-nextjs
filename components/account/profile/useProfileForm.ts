import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ProfileFormData, profileSchema, ProfileFormValues } from "@/components/account/profile/profile.schema";
import { updateUserProfile } from "@/components/account/profile/profile.actions";
import imageCompression from 'browser-image-compression';

interface UseProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSuccess?: () => void; // Dibuat lebih simpel
}

export function useProfileForm({ initialData, onSuccess }: UseProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(initialData?.avatar || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      uid: initialData?.uid || '',
      name: initialData?.name || '',
      username: initialData?.username || '',
      bio: initialData?.bio || '',
      email: initialData?.email || '',
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        uid: initialData.uid || '',
        name: initialData.name || '',
        username: initialData.username || '',
        bio: initialData.bio || '',
        email: initialData.email || '',
        avatar: undefined,
      });
      setCurrentAvatarUrl(initialData.avatar || null);
    }
  }, [initialData, form.reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    const formData = new FormData()

    formData.append('name', data.name);
    formData.append('username', data.username);
    formData.append('bio', data.bio);
    if (data.avatar?.[0]) {
      console.log(`Ukuran asli: ${(data.avatar[0].size / 1024 / 1024).toFixed(2)} MB`);
      const options = {
        maxSizeMB: 0.5,           // Target ukuran file maksimal (misal: 0.5MB)
        maxWidthOrHeight: 800,    // Resize gambar agar sisi terpanjangnya 800px
        useWebWorker: true,       // Gunakan web worker agar UI tidak freeze
      };

      const compressedFile = await imageCompression(data.avatar[0], options);
      console.log(`Ukuran setelah kompresi: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      formData.append('avatar', compressedFile);
    }

    try {
      // Panggil Server Action
      const result = await updateUserProfile(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsLoading(false);
    }


    
    // try {
    //   let newAvatarUrl = currentAvatarUrl;
    //   const avatarFile = data.avatar?.[0];

    //   // Jika ada file avatar baru, unggah dulu
    //   if (avatarFile) {
    //     newAvatarUrl = await uploadAvatar(avatarFile, data.uid, currentAvatarUrl);
    //     setCurrentAvatarUrl(newAvatarUrl);
    //     await updateUserProfile(data.uid, data.name, newAvatarUrl);
    //     onSuccess?.({ name: data.name, avatar: newAvatarUrl });
    //     toast.success('Profil berhasil diperbarui dengan avatar baru!');
    //   }
    //     // Jika tidak ada file avatar baru
    //   else{
    //     await updateUserProfile(data.uid, data.name);
    //     onSuccess?.({ name: data.name, avatar: newAvatarUrl });
    //     toast.success('Profil berhasil diperbarui!');
    //   }
    
    // } catch (error) {
    //   toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return { form, isLoading, onSubmit, currentAvatarUrl };
}