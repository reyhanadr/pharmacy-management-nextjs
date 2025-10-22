'use server'

import { createClient } from '@/utils/supabase/server'

export interface Product {
  id: number;
  name: string;
  code: string;
  price_buy: number;
  price_sell: number;
  stock: number;
  category: string | null;
  supplier_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string | null;
  address: string | null;
  phone: string | null;
}

export interface PurchaseOrderItem {
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  price_buy: number;
  total: number;
}

export interface PurchaseOrderResponse {
  id: number;
  supplier_id: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'completed' | 'received' | 'canceled';
  created_at: string;
  created_by: string;
  suppliers: { name: string } | null;
  profiles: { full_name: string } | null;
  purchase_order_items: Array<{
    id: number;
    purchase_order_id: number;
    product_id: number;
    quantity: number;
    price_buy: number;
    total: number;
    products: { name: string; code: string } | null;
  }>;
}

// Get all products with optional supplier filter
export async function getProducts(supplierId?: number): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .order('name');

  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data || [];
}

// Get all suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }

  return data || [];
}

// Create purchase order and stock logs
export async function createPurchaseOrder(
  supplierId: number,
  items: PurchaseOrderItem[],
  userId: string,
  goodsReceived: boolean = false
): Promise<void> {
  const supabase = await createClient()

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Determine status based on goods received confirmation
  const status = goodsReceived ? 'received' : 'pending';

  // Start transaction - create purchase order first
  const { data: purchaseOrder, error: purchaseError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: supplierId,
      total_amount: totalAmount,
      status: status,
      created_by: userId,
    })
    .select()
    .single();

  if (purchaseError) {
    console.error('Error creating purchase order:', purchaseError);
    throw new Error(`Failed to create purchase order: ${purchaseError.message}`);
  }

  // Create purchase order items
  const orderItems = items.map(item => ({
    purchase_order_id: purchaseOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_buy: item.price_buy,
    total: item.total,
  }));

  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating purchase order items:', itemsError);
    throw new Error(`Failed to create purchase order items: ${itemsError.message}`);
  }

  // If goods are received, the trigger will automatically create stock logs
  // No need to manually create stock logs here as the trigger handles it
}

// Get purchase order history
export async function getPurchaseOrders(): Promise<PurchaseOrderResponse[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers (name),
      profiles!created_by (full_name),
      purchase_order_items (
        *,
        products (name, code)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error(`Failed to fetch purchase orders: ${error.message}`);
  }

  return data || [];
}

// Update purchase order status to received
export async function receivePurchaseOrder(purchaseOrderId: number): Promise<void> {
  const supabase = await createClient()

  // First, check if purchase order exists and get its items
  const { data: purchaseOrder, error: fetchError } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      purchase_order_items (
        product_id,
        quantity,
        price_buy
      )
    `)
    .eq('id', purchaseOrderId)
    .single()

  if (fetchError) {
    console.error('Error fetching purchase order:', fetchError)
    throw new Error(`Failed to fetch purchase order: ${fetchError.message}`)
  }

  if (!purchaseOrder) {
    throw new Error('Purchase order not found')
  }

  if (purchaseOrder.status === 'received') {
    throw new Error('Purchase order is already received')
  }

  if (purchaseOrder.status === 'canceled') {
    throw new Error('Cannot receive a canceled purchase order')
  }

  // Update purchase order status to received
  const { error: updateError } = await supabase
    .from('purchase_orders')
    .update({ status: 'received' })
    .eq('id', purchaseOrderId)

  if (updateError) {
    console.error('Error updating purchase order status:', updateError)
    throw new Error(`Failed to receive purchase order: ${updateError.message}`)
  }

  // The database trigger should automatically create stock logs when status changes to 'received'
}

// Update purchase order status to canceled
export async function cancelPurchaseOrder(purchaseOrderId: number): Promise<void> {
  const supabase = await createClient()

  // First, check if purchase order exists
  const { data: purchaseOrder, error: fetchError } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', purchaseOrderId)
    .single()

  if (fetchError) {
    console.error('Error fetching purchase order:', fetchError)
    throw new Error(`Failed to fetch purchase order: ${fetchError.message}`)
  }

  if (!purchaseOrder) {
    throw new Error('Purchase order not found')
  }

  if (purchaseOrder.status === 'received') {
    throw new Error('Cannot cancel a received purchase order')
  }

  if (purchaseOrder.status === 'canceled') {
    throw new Error('Purchase order is already canceled')
  }

  // Update purchase order status to canceled
  const { error: updateError } = await supabase
    .from('purchase_orders')
    .update({ status: 'cancelled' })
    .eq('id', purchaseOrderId)

  if (updateError) {
    console.error('Error updating purchase order status:', updateError)
    throw new Error(`Failed to cancel purchase order: ${updateError.message}`)
  }
}

// Delete purchase order (only if not received or completed)
export async function deletePurchaseOrder(purchaseOrderId: number): Promise<void> {
  const supabase = await createClient()

  // First, check if purchase order exists
  const { data: purchaseOrder, error: fetchError } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', purchaseOrderId)
    .single()

  if (fetchError) {
    console.error('Error fetching purchase order:', fetchError)
    throw new Error(`Failed to fetch purchase order: ${fetchError.message}`)
  }

  if (!purchaseOrder) {
    throw new Error('Purchase order not found')
  }

  if (purchaseOrder.status === 'received') {
    throw new Error('Cannot delete a received purchase order')
  }

  if (purchaseOrder.status === 'completed') {
    throw new Error('Cannot delete a completed purchase order')
  }

  // Delete purchase order items first (due to foreign key constraint)
  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .delete()
    .eq('purchase_order_id', purchaseOrderId)

  if (itemsError) {
    console.error('Error deleting purchase order items:', itemsError)
    throw new Error(`Failed to delete purchase order items: ${itemsError.message}`)
  }

  // Delete the purchase order
  const { error: deleteError } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', purchaseOrderId)

  if (deleteError) {
    console.error('Error deleting purchase order:', deleteError)
    throw new Error(`Failed to delete purchase order: ${deleteError.message}`)
  }
}
