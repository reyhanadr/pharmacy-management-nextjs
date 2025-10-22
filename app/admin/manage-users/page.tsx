import { ManageUsersPageClient } from "./manage-user-client"
import { getUsers } from "@/components/manage-users/manage-users-action"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ManageUsersPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }
  const users = await getUsers()

  return (
    <ManageUsersPageClient initialUsers={users} currentUserId={userData.id} />
  )
}