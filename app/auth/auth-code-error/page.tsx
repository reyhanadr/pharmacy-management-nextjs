'use client';

import { toast } from 'sonner';   
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AuthCodeErrorPage() {

  useEffect(() => {
    toast.error('Gagal masuk dengan Google. Silakan coba lagi.');
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Gagal Masuk</h1>
      <p className="mb-4">Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.</p>
      <Link href="/login">
        <Button>Kembali ke Halaman Login</Button>
      </Link>
    </div>
  );
}