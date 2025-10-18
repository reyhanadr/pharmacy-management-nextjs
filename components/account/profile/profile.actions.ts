// file: app/account/actions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Fungsi ini akan menangani semuanya: upload, update, dan keamanan.
export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Keamanan: Ambil pengguna dari sesi server yang aman.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Otentikasi gagal. Silakan login kembali.' };
  }

  // 2. Ambil dan validasi data dari form
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const username = (formData.get('username') as string)?.trim();
  const file = formData.get('avatar') as File | null;

  // Validasi username
  if (!username || username.length < 2) {
    return { error: 'Username harus terdiri dari minimal 2 karakter.' };
  }

  // Cek apakah username sudah digunakan oleh user lain
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single();

  if (existingUser) {
    return { error: 'Username sudah digunakan. Silakan pilih username lain.' };
  }

  let newAvatarUrl: string | undefined = undefined;

  // 3. Logika Unggah File (jika ada file baru)
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Server Upload Error:', uploadError);
      return { error: 'Gagal mengunggah gambar profil.' };
    }

    // Dapatkan URL publik dari file yang baru diunggah
    newAvatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;

    // Hapus avatar lama dari storage (lebih aman di sini)
    const oldAvatarUrl = user.user_metadata.avatar_url;
    if (oldAvatarUrl) {
      const oldFileName = oldAvatarUrl.split('/').pop();
      if (oldFileName) {
        await supabase.storage.from('avatars').remove([oldFileName]);
      }
    }
  }

  // 4. Update data di auth.users (SUMBER KEBENARAN UTAMA)
  // Trigger database akan otomatis menyinkronkan ke tabel 'users' Anda.
  // const { error: updateError } = await supabase.auth.updateUser({
  //   data: {
  //     name: name,
  //     // Gunakan URL baru jika ada, jika tidak, pertahankan URL lama
  //     avatar_url: newAvatarUrl || user.user_metadata.avatar_url,
  //   }
  // });

    // 4. INTI PERUBAHAN: Update tabel 'public.users', bukan 'auth.users'
    const { error: updateError } = await supabase
    .from('users') 
    .update({
      display_name: name,
      avatar_url: newAvatarUrl,
      username: username,
      bio: bio,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Server Update User Error:', updateError);
    return { error: 'Gagal memperbarui data profil.' };
  }

  // 5. Revalidasi path agar UI menampilkan data baru
  revalidatePath('/account/settings'); // Ganti dengan path halaman profil Anda
  return { success: true, message: 'Profil berhasil diperbarui!' };
}