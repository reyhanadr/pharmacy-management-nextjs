import { InventoryListPageClient } from "./inventory-list-client"
import { getProducts } from "@/components/inventory/inventory-action"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function InventoryListPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }

  const products = await getProducts()

  return (
    <InventoryListPageClient initialProducts={products} />
  )
}