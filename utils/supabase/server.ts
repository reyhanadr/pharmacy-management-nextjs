import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function getUserData() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null, hasPassword: false };
  }

  // Call RPC function
  const { data: hasPassword, error: rpcError } = await supabase
    .rpc('has_password', { user_id: user.id });

  if (rpcError) {
    console.error('Error checking password status:', rpcError);
    return { user, profile: null, hasPassword: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  return { user, profile: profile || null, hasPassword };
}

export async function getUserDataByUsername(username: string){
  const supabase = await createClient();
  const { data: userData } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .single();

  return userData;
}