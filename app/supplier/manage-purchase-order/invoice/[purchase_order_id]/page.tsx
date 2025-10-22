import { PurchaseOrderInvoiceClient } from './purchase-order-invoice-client';
import { getPurchaseOrderDetail } from '@/components/purchase-order-invoice/po-invoice-action';
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface PurchaseOrderInvoicePageProps {
  params: {
    purchase_order_id: string
  }
}

export default async function PurchaseOrderInvoice({ params }: PurchaseOrderInvoicePageProps) {
  const userData = await getUserData();

  if (!userData) {
    redirect('/login');
  }

  const purchaseOrderId = parseInt(params.purchase_order_id);
  const purchaseOrder = await getPurchaseOrderDetail(purchaseOrderId);

  if (!purchaseOrder) {
    redirect('/supplier/manage-purchase-order');
  }

  return (
    <PurchaseOrderInvoiceClient purchaseOrder={purchaseOrder} />
  );
}