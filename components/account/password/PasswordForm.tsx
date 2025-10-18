"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { updateUserPassword } from "./password.action";

// Skema Zod kini dinamis
const createPasswordSchema = (hasPasswordProvider: boolean) => z.object({
  currentPassword: z.string().optional(), // Dibuat opsional
  newPassword: z.string().min(6, "Kata sandi harus minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi kata sandi harus diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
}).refine((data) => {
    // Jika user punya password, maka kolom currentPassword wajib diisi
    if (hasPasswordProvider) {
      return !!data.currentPassword && data.currentPassword.length >= 6;
    }
    return true;
}, {
  message: "Password saat ini harus diisi (minimal 6 karakter)",
  path: ["currentPassword"],
});

interface PasswordFormProps {
  // Prop baru untuk mendeteksi tipe pengguna
  hasPasswordProvider: boolean;
  onSuccess?: () => void;
}

export function PasswordForm({hasPasswordProvider, onSuccess }: PasswordFormProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Dapatkan tipe Zod dari skema dinamis
  type PasswordFormValues = z.infer<ReturnType<typeof createPasswordSchema>>;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(createPasswordSchema(hasPasswordProvider)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setError } = form;

  // Modifikasi onSubmit untuk memanggil Server Action
  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);

    if (hasPasswordProvider && data.currentPassword === data.newPassword) {
      setError('newPassword', {
        type: 'manual',
        message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama',
      });
      setIsLoading(false);
      return;
    }

    // Buat FormData untuk dikirim ke Server Action
    const formData = new FormData();
    if (data.currentPassword) {
      formData.append('currentPassword', data.currentPassword);
    }
    formData.append('newPassword', data.newPassword);

    try {
      const result = await updateUserPassword(formData);

      if (result.error) {
        // Jika error dari server, tampilkan di field yang relevan
        if (result.error.includes("salah")) {
          setError('currentPassword', { type: 'manual', message: result.error });
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success(result.message);
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsLoading(false);
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  // const onSubmit = async (data: PasswordFormValues) => {
  //   try {
  //     setIsLoading(true);
      
  //     // Validasi tambahan
  //     if (hasPasswordProvider && data.currentPassword === data.newPassword) {
  //       setError('newPassword', {
  //         type: 'manual',
  //         message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama',
  //       });
  //       setIsLoading(false);
  //       return;
  //     }

  //     // Buat FormData untuk dikirim ke Server Action
  //     const formData = new FormData();
  //     if (data.currentPassword) {
  //       formData.append('currentPassword', data.currentPassword);
  //     }
  //     formData.append('newPassword', data.newPassword);
  //     try {
  //       const result = await updateUserPassword(formData);
  
  //       if (result.error) {
  //         // Jika error dari server, tampilkan di field yang relevan
  //         if (result.error.includes("salah")) {
  //           setError('currentPassword', { type: 'manual', message: result.error });
  //         } else {
  //           toast.error(result.error);
  //         }
  //       } else {
  //         toast.success(result.message);
  //         reset();
  //         onSuccess?.();
  //       }
  //     } catch (error) {
  //       console.error('Error updating password:', error);
  //       toast.error("Terjadi kesalahan yang tidak terduga.");
  //     } finally {
  //       setIsLoading(false);
  //     }

  //     // Reset form
  //     reset({
  //       currentPassword: '',
  //       newPassword: '',
  //       confirmPassword: '',
  //     });
      
  //     toast.success("Kata sandi berhasil diperbarui");
      
  //     if (onSuccess) {
  //       onSuccess();
  //     }
  //   } catch (error) {
  //     console.error('Error updating password:', error);
  //     toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const toggleCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {/* Section for current password (only shown if user has password) */}
        {hasPasswordProvider && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-semibold">Password Sekarang</Label>
              <p className="text-sm text-muted-foreground mb-2">Masukin dulu password lamanya, ya!</p>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  {...register('currentPassword')}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={toggleCurrentPassword}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            
            {/* Separator */}
            <div className="relative my-4 mt-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background dark:bg-background/50 px-2 text-muted-foreground text-sm">
                  Ganti Password Baru
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section for new password */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="font-semibold">
              {hasPasswordProvider ? 'Password Baru' : 'Bikin Password Baru'}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              {hasPasswordProvider 
                ? 'Ayo buat password yang lebih keren!' 
                : 'Yuk, bikin password aman buat akunmu!'}
            </p>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                {...register('newPassword')}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={toggleNewPassword}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              ✨ Tips: Minimal 6 karakter, campur huruf & angka biar makin aman!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {hasPasswordProvider ? 'Konfirmasi Password Baru' : 'Konfirmasi Password'}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukkan ulang password baru"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={toggleConfirmPassword}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Nungguin ya...
            </>
          ) : hasPasswordProvider ? (
            'Ganti Password Yuk! 🔒'
          ) : (
            'Simpan Password Aku! 🚀'
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          Jangan lupa catat password barunya, ya! 😉
        </p>
      </div>
    </form>
  );
}
