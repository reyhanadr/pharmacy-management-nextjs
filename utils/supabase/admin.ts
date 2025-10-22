import { createClient as createAdministratorClient } from '@supabase/supabase-js';

export default function createAdminClient() {
  return createAdministratorClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
    { 
        auth: { 
            autoRefreshToken: false, 
            persistSession: false 
        } 
    }
  );
}
