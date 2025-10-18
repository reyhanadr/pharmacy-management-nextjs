"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import createClient from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter} from "next/navigation";
import { AuthError } from "@supabase/supabase-js";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check if the password reset link is valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // If there's no session, the link is invalid or expired
        if (!data.session) {
          setIsValidLink(false);
          return;
        }
        
        // If we have a session, the link is valid
        setIsValidLink(true);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsValidLink(false);
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }
    
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      setError(error instanceof AuthError ? error.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking the link
  if (isValidLink === null) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p>Memeriksa tautan reset password...</p>
      </div>
    );
  }

  // Show error if the link is invalid
  if (isValidLink === false) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tautan Tidak Valid</h2>
        <p className="text-muted-foreground mb-6">
          Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.
        </p>
        <Button onClick={() => router.push('/forgot-password')}>
          Minta Tautan Baru
        </Button>
      </div>
    );
  }

  // Show success message after password reset
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Kata Sandi Berhasil Diubah</h2>
        <p className="text-muted-foreground">
          Kata sandi Anda telah berhasil diubah. Anda akan diarahkan ke halaman masuk dalam beberapa detik...
        </p>
      </div>
    );
  }

  // Show the password reset form
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border"
    >
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Atur Ulang Kata Sandi
        </h1>
        <p className="text-muted-foreground">
          Masukkan kata sandi baru untuk akun Anda.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Lock className="h-4 w-4" />
            Kata Sandi Baru
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="•••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 text-base"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Lock className="h-4 w-4" />
            Konfirmasi Kata Sandi
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="•••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 text-base"
            required
            minLength={6}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-base font-medium gap-2 mt-2" 
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Atur Ulang Kata Sandi"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
