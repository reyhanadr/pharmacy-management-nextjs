'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { AuthError } from '@supabase/supabase-js'

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type ActionResult = {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
};

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Basic validation
  if (!email || !password) {
    return { error: 'Email dan password harus diisi' };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Login error:', authError);

    // Handle specific error cases
    let errorMessage = 'Gagal masuk. Silakan coba lagi';

    switch (authError.message) {
      case 'Invalid login credentials':
      case 'Invalid email or password':
        errorMessage = 'Email atau password salah';
        break;
      case 'Email not confirmed':
        errorMessage = 'Email belum dikonfirmasi. Silakan periksa email Anda';
        break;
      case 'Email rate limit exceeded':
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti';
        break;
    }

    return { error: errorMessage };
  }

  revalidatePath('/', 'layout');
  redirect('/');
  return { success: true }; // This line is a fallback and won't be reached
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    // Check if email exists in auth.users


    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
      return { error: 'Terjadi kesalahan saat memeriksa profil. Silakan coba lagi.' };
    }

    if (!profile) {
      return { error: 'Profil pengguna tidak ditemukan. Silakan hubungi administrator.' };
    }

    // If we get here, both auth user and profile exist
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const redirectTo = `${siteUrl}/auth/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      console.error('Error sending reset email:', resetError);
      return { error: 'Gagal mengirim email reset password. Silakan coba lagi.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in requestPasswordReset:', error);
    return { error: 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.' };
  }
}

export async function forgotPassword(formData: FormData): Promise<UserProfile | null> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// export async function signInWithGoogle(): Promise<ActionResult> {
//   const supabase = await createClient();
  
//   try {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         queryParams: {
//           access_type: 'offline',
//           prompt: 'consent',
//         },
//         redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
//       },
//     });

//     if (error) {
//       console.error('Google OAuth error:', error);
//       return { error: 'Gagal masuk dengan Google. Silakan coba lagi.' };
//     }

//     if (data.url) {
//       // Kembalikan URL redirect untuk ditangani di sisi klien
//       return { success: true, redirectUrl: data.url };
//     }

//     return { error: 'Tidak ada URL redirect dari Supabase.' };
//   } catch (err) {
//     console.error('Unexpected error during Google OAuth:', err);
//     return { error: 'Terjadi kesalahan tak terduga. Silakan coba lagi.' };
//   }
// }

// export async function register(formData: FormData): Promise<ActionResult> {
//   const supabase = await createClient()
//   const email = formData.get('email') as string;
//   const password = formData.get('password') as string;
//   const name = formData.get('name') as string;
  
//   // Basic validation
//   if (!name) {
//     return { error: 'Nama harus diisi' };
//   }
//   if (!email || !password) {
//     return { error: 'Email dan password harus diisi' };
//   }

//   // Email format validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return { error: 'Format email tidak valid' };
//   }

//   // Password strength validation
//   if (password.length < 6) {
//     return { error: 'Password minimal 6 karakter' };
//   }

//   try {
//     // Check if email already exists
//     const { data: existingUser } = await supabase
//       .from('users')
//       .select('email')
//       .eq('email', email)
//       .single();

//     if (existingUser) {
//       return { error: 'Email sudah terdaftar' };
//     }

//     const data = {
//       email,
//       password,
//       options: {
//         data: {
//           full_name: name,
//           email_redirect_to: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?type=signup`
//         }
//       },
//     }

//     // Create user
//     const { error: signUpError } = await supabase.auth.signUp(data);

//     if (signUpError) {
//       console.error('Registration error:', signUpError);
      
//       // Handle specific error cases
//       let errorMessage = 'Gagal mendaftar. Silakan coba lagi.';
      
//       switch (signUpError.message) {
//         case 'User already registered':
//           errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau lakukan login.';
//           break;
//         case 'Password should be at least 6 characters':
//           errorMessage = 'Password minimal 6 karakter';
//           break;
//         case 'Invalid email':
//           errorMessage = 'Format email tidak valid';
//           break;
//         case 'Email rate limit exceeded':
//           errorMessage = 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti';
//           break;
//       }
      
//       return { error: errorMessage };
//     }

//     revalidatePath('/', 'layout');
//     // Redirect to login page with success message
//     redirect('/login?register=success');
//   } catch (error) {
//     if (error instanceof Error) {
//       throw error; // Re-throw the error to be handled by the form
//     }
//     throw new Error('Terjadi kesalahan saat mendaftar');
//   }
// }