import { NewTransactionPageClient } from "./new-transaction-client"
import { getUserData } from '@/utils/supabase/server';
import { getProducts } from '@/components/cashier/cashier-action';
import { redirect } from 'next/navigation';
import type { Product, UserProfile } from '@/components/cashier/cashier-action';

export default async function NewTransactionPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }

  // Fetch products for the transaction form
  let initialProducts: Product[] = [];
  try {
    initialProducts = await getProducts();
  } catch (error) {
    console.error('Error fetching products for transaction:', error);
    // Continue with empty array if there's an error
  }

  return (
    <NewTransactionPageClient
      initialProducts={initialProducts}
      userData={userData as UserProfile}
    />
  )
}