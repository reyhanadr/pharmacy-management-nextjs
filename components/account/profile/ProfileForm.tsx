"use client";

import { useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useProfileForm } from "@/components/account/profile/useProfileForm";
import { ProfileFormData } from "@/components/account/profile/profile.schema";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const { form, isLoading, onSubmit } = useProfileForm({ initialData, onSuccess });
  const { register, handleSubmit, formState: { errors } } = form;
  const searchParams = useSearchParams();

  // Efek untuk notifikasi verifikasi email (bisa tetap di sini)
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success("Verifikasi Berhasil", {
        description: "Email Anda telah berhasil diverifikasi!",
      });
      window.history.replaceState(null, '', window.location.pathname);
    }else if (searchParams.get('changed') === 'true') {
      toast.success("Perubahan Email Berhasil", {
        description: "Email Anda telah berhasil diperbarui!",
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            placeholder="Nama lengkap"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Username"
            {...register('username')}
            // disabled={isLoading}
            disabled
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </div>
    </form>
  );
}