// file: app/account/actions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserPassword(formData: FormData) {
  const supabase = await createClient();

  // 1. Dapatkan pengguna dari sesi yang aman
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: 'Pengguna tidak terautentikasi.' };
  }

  const currentPassword = formData.get('currentPassword') as string | null;
  const newPassword = formData.get('newPassword') as string;

  // 2. Cek apakah pengguna memiliki password sebelumnya (bukan pengguna OAuth)
  // Indikator terbaik adalah provider 'email'. Pengguna Google/GitHub/dll tidak akan punya ini.
  const hasPasswordProvider = user.app_metadata.provider === 'email';

  // 3. Jika pengguna punya password, validasi password lama mereka
  if (hasPasswordProvider) {
    if (!currentPassword) {
      return { error: 'Password saat ini harus diisi.' };
    }
    // Cara teraman untuk memvalidasi password lama adalah dengan mencoba login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { error: 'Password saat ini yang Anda masukkan salah.' };
    }
  }

  // 4. Update password dengan yang baru
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Update Password Error:", updateError);
    return { error: 'Gagal memperbarui password. Coba lagi nanti.' };
  }

  revalidatePath('/account/settings'); // Ganti dengan path halaman Anda
  return { success: true, message: 'Password berhasil diperbarui!' };
}