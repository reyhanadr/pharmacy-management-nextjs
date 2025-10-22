import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { UserProfile } from "@/components/auth/auth.action";

export async function createClient() {
  const cookieStore = await cookies();

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            console.log(cookiesToSet)
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getUserData(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user:', userError);
  }

  // Call RPC function
  // const { data: hasPassword, error: rpcError } = await supabase
  //   .rpc('has_password', { user_id: user.id });

  // if (rpcError) {
  //   console.error('Error checking password status:', rpcError);
  //   return { user, profile: null, hasPassword: false };
  // }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  return profile as UserProfile;
}

export async function getUserDataByUsername(username: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: userData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user data by username:', error);
  }

  return userData as UserProfile;
}