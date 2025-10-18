"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import createClient from "@/utils/supabase/client";

const emailSchema = z.object({
  email: z.string().email({
    message: "Waduh, emailnya kayanya kurang tepat nih",
  }),
  currentPassword: z.string().min(6, {
    message: "Minimal 6 karakter ya, biar aman!",
  }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailFormProps {
  email: string;
  hasPasswordProvider: boolean;
  onSuccess?: (newEmail: string) => void;
}

export function EmailForm({ email, hasPasswordProvider, onSuccess }: EmailFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email,
      currentPassword: "",
    },
  });
  
  // Update form values when email prop changes
  useEffect(() => {
    form.reset({
      email,
      currentPassword: "",
    });
  }, [email, form]);
  const { register, handleSubmit, formState: { errors } } = form;

  // const updateEmailInDatabase = async (userId: string, newEmail: string) => {
  //   const { error } = await supabase
  //     .from('users')
  //     .update({ email: newEmail })
  //     .eq('id', userId);
    
  //   if (error) throw error;
  // };

  const onSubmit = async (data: EmailFormValues) => {
    try {
      setIsLoading(true);
      
      // Validate if email has changed
      if (data.email === email) {
        toast.info("Wah, emailnya masih sama nih!");
        return;
      }
      console.log(data.email);

      // First, verify the password by signing in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: data.currentPassword,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Kata sandi salah');
        }
        throw signInError;
      }

      if (!authData.user) {
        throw new Error('Gagal memverifikasi akun');
      }

      // Update email in auth
      const { error: updateError } = await supabase.auth.updateUser(
        { email: data.email },
        { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`}
      );

      if (updateError) throw updateError;

      // Update email in database
      // await updateEmailInDatabase(authData.user.id, data.email);
      
      // Call onSuccess callback with new email
      if (onSuccess) {
        onSuccess(data.email);
      }
      
      toast.success("Cek email barumu ya! Jangan lupa buka link verifikasinya ✉️");
      
      // Reset form with new email
      form.reset({
        email: data.email,
        currentPassword: "",
      });
      
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error(error instanceof Error ? error.message : "Yah, ada yang error nih. Coba lagi ya!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPasswordProvider) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold">Email Baru</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@contoh.com"
            {...register("email")}
            disabled={isLoading}
            className="mt-1"
          />
          {errors.email ? (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Email kamu sekarang: <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
          {/* {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )} */}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="currentPassword" className="font-semibold">Password Sekarang</Label>
            <button
              type="button"
              className="text-sm text-primary hover:underline flex items-center gap-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈 Sembunyikan' : '👁️ Tampilkan'}
            </button>
          </div>
          <Input
            id="currentPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Masukin password dulu ya"
            {...register("currentPassword")}
            disabled={isLoading}
            className="mt-1"
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Nungguin ya...
              </>
            ) : (
              'Ganti Email Sekarang! ✨'
            )}
          </Button>
        </div>
    </form>

  );
}
