import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/layout/header';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'


export type Profile = {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
};

export default async function AccountSettingsPage() {
  const { user, profile, hasPassword } = await getUserData();
  
  if (!user) {
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
              <SettingsClient user={user} profile={profile} hasPassword={hasPassword} />
            </div>
          </div>
        </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
