import { ManagePurchaseOrderClient } from './manage-purchase-order-client';
import { getPurchaseOrders } from '@/components/purchase-order/purchase-order-action';
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function PurchaseHistoryPage() {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }
  
  const purchaseOrders = await getPurchaseOrders();
  console.log(purchaseOrders)
  return (
    <ManagePurchaseOrderClient initialPurchaseOrders={purchaseOrders} />
  );
}