"use client";

import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import createClient from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use the site URL from environment variables or fallback to the current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Periksa Email Anda</h2>
          <p className="text-muted-foreground">
            Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <span className="font-medium">{email}</span>.
            Silakan periksa kotak masuk email Anda dan ikuti petunjuknya.
          </p>
          <Button 
            className="w-full mt-4 cursor-pointer" 
            onClick={() => router.push('/login')}
          >
            Kembali ke Halaman Masuk
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border"
    >
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Lupa Kata Sandi
        </h1>
        <p className="text-muted-foreground">
          Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
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
          <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-11 text-base"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-base font-medium gap-2 cursor-pointer" 
          disabled={isLoading || !email}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <span>Kirim Tautan Reset</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Ingat kata sandi Anda?{" "}
        <Link 
          href="/login" 
          className="text-primary hover:underline font-medium transition-colors"
        >
          Kembali ke Masuk
        </Link>
      </p>
    </motion.div>
  );
}
