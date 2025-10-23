import { TransactionHistoryClient } from "./transaction-history-client"
import { getProducts, getTransactionHistory } from "@/components/cashier/cashier-action"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Transaction, Product } from "@/components/cashier/cashier-action";

interface ExtendedUserData {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    role?: string
  }
}

export default async function TransactionHistoryPage() {
  const userData = await getUserData() as ExtendedUserData;

  if (!userData) {
    redirect('/login');
  }

  // Fetch transaction history and products
  let transactions: Transaction[] = [];
  let products: Product[] = [];

  try {
    [transactions, products] = await Promise.all([
      getTransactionHistory(userData.id), // Get current user's transactions
      getProducts()
    ]);
  } catch (error) {
    console.error('Error fetching transaction history data:', error);
  }

  return (
    <TransactionHistoryClient
      initialTransactions={transactions}
      initialProducts={products}
    />
  )
}