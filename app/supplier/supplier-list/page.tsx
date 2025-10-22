import { SupplierListPageClient } from "./supplier-list-client"
import { getSuppliers } from "@/components/supplier/supplier-action"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SupplierListPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }

  const suppliers = await getSuppliers()

  return (
    <SupplierListPageClient initialSuppliers={suppliers} />
  )
}