'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
// import type { ProfilePost } from '@/components/post-item/post-item';


// export async function getProfileByUserId(userId: string) {
//   const supabase = await createClient();

//   try {
//     // Dapatkan data profil dari tabel users
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id, username, display_name, avatar_url')
//       .eq('id', userId)
//       .single<ProfilePost>();

//     if (userError || !user) {
//       console.error('Error fetching user profile:', userError);
//       return { data: null, error: 'Profil tidak ditemukan' };
//     }

//     // Gabungkan data
//     const profileData: ProfilePost = {
//       user_id: userId,
//       username: user.username,
//       display_name: user.display_name,
//       avatar_url: user.avatar_url,
//     };

//     return { data: profileData, error: null };
//   } catch (error) {
//     console.error('Unexpected error in getProfileByUserId:', error);
//     return { data: null, error: 'Terjadi kesalahan saat memuat profil' };
//   }
// }

export async function updateUserCover(userId: string, newCoverUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({ cover_url: newCoverUrl })
    .eq('id', userId);

  if (error) {
    console.error('Error updating cover URL:', error);
    return { error: 'Gagal memperbarui foto sampul.' };
  }

  // Merevalidasi path agar Next.js mengambil data baru
  revalidatePath(`/account`); // Sesuaikan jika path profil Anda dinamis
  return { success: 'Foto sampul berhasil diperbarui.' };
}

// Menambahkan server action untuk memperbarui avatar pengguna
export async function updateUserAvatar(userId: string, newAvatarUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({ avatar_url: newAvatarUrl })
    .eq('id', userId);

  if (error) {
    console.error('Error updating avatar URL:', error);
    return { error: 'Gagal memperbarui avatar.' };
  }

  revalidatePath(`/account`);
  return { success: 'Avatar berhasil diperbarui.' };
}