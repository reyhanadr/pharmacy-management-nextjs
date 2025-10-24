import { TransactionHistoryClient } from "./transaction-history-client"
import { getProducts, getTransactionHistory } from "@/components/cashier/cashier-action"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Transaction} from "@/components/cashier/cashier-action";

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

  // Fetch transaction history
  let transactions: Transaction[] = [];

  try {
    [transactions] = await Promise.all([
      getTransactionHistory(userData.id), 
    ]);
  } catch (error) {
    console.error('Error fetching transaction history data:', error);
  }

  return (
    <TransactionHistoryClient
      initialTransactions={transactions}
      // initialProducts={products}
    />
  )
}