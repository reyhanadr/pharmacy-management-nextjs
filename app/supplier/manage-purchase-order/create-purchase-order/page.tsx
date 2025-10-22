import { CreatePurchaseOrderClient } from './create-po-client';
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CreatePurchaseOrderPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }

  return (
    <CreatePurchaseOrderClient userData={userData} />
  );
}