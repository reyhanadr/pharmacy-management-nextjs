import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/layout/header';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { createClient } from '@/utils/supabase/server';

export type Profile = {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
};

export default async function AccountSettingsPage() {
  const profile = await getUserData();
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user || !profile) {
    redirect('/login');
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SettingsClient
                user={user}
                profile={{
                  username: profile.username,
                  display_name: profile.full_name,
                  bio: '', // Add bio field to UserProfile if needed
                  avatar_url: null // Add avatar_url field to UserProfile if needed
                }}
                hasPassword={true} // Since password functionality was removed, default to true
              />
            </div>
          </div>
        </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
