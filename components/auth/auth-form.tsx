"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login } from '@/components/auth/auth.action';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AuthFormProps {
  onSuccess?: () => void;
  heading?: string;
  // subheading?: string;
}

export function AuthForm({ 
  heading,
  // subheading
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(formData);
      // If login is successful, the server will redirect
      // If we get here, it means there was an error
      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      
      if (error instanceof Error) {
        // Handle redirect responses that might be in the error message
        if (error.message.includes('NEXT_REDIRECT')) {
          return; // Let the redirect happen
        }
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // const handleGoogleSignIn = async () => {
  //   setIsLoading(true);
  //   try {
  //     const result = await signInWithGoogle();
  //     if (result.error) {
  //       toast.error(result.error);
  //     } else if (result.redirectUrl) {
  //       // Arahkan pengguna ke URL Google OAuth
  //       window.location.href = result.redirectUrl;
  //     }
  //   } catch (error) {
  //     console.error('Error during Google sign-in:', error);
  //     toast.error('Gagal masuk dengan Google. Silakan coba lagi.');
  //   } finally {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const register_status = searchParams.get('register');
  //   if (register_status === 'success') {
  //     toast.success("Pendaftaran Berhasil", {
  //       description: "Cek Email anda untuk verifikasi!",
  //     });

  //     // Opsional: Bersihkan parameter query dari URL
  //       // const cleanUrl = window.location.pathname;
  //       // window.history.replaceState(null, '', cleanUrl);
  //   }
  // }, [searchParams, toast]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-card rounded-xl shadow-sm border border-border"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2 text-center mb-8"
      >
        <motion.h1 
          variants={item}
          className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
        >
          {heading || "Selamat Datang Kembali"}
        </motion.h1>
        <motion.p 
          variants={item}
          className="text-muted-foreground"
        >
          Masuk untuk melanjutkan ke dashboard Anda
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >

        <motion.div 
          className="space-y-2"
          variants={item}
        >
          <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@contoh.com"
            disabled={isLoading}
            className="h-11 text-base"
          />
        </motion.div>

        <motion.div 
          className="space-y-2"
          variants={item}
        >
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Link 
              href="/forgot-password"
              className="text-sm text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              Lupa password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            disabled={isLoading}
            placeholder="•••••••"
            className="h-11 text-base"
          />
        </motion.div>

        <motion.div variants={item}>
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium gap-2 transition-all cursor-pointer" 
            disabled={isLoading}
            // whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      {/* <motion.div 
        className="relative my-6"
        variants={item}
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground text-xs">
            Atau lanjutkan dengan
          </span>
        </div>
      </motion.div> */}

      {/* <motion.div variants={item}>
        <Button 
          variant="outline" 
          type="button" 
          className="w-full h-11 gap-2 transition-all hover:bg-muted/50 cursor-pointer"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          // whileHover={{ scale: 1.01 }}
          // whileTap={{ scale: 0.98 }}
        >
          <Image 
            src="/google.svg" 
            alt="Google" 
            width={16} 
            height={16} 
            className="h-4 w-4"
          />
          <span>Lanjutkan dengan Google</span>
        </Button>
      </motion.div> */}

      <motion.p 
        className="text-center text-sm text-muted-foreground pt-2"
        variants={item}
      >
        <Link 
          href="/forgot-password"
          className="text-primary hover:underline font-medium transition-colors"
        >
          Lupa password?
        </Link>
      </motion.p>
    </motion.div>
)}