'use server'

import { createClient } from '@/utils/supabase/server'
import type { UserProfile } from '@/components/auth/auth.action'
export interface PurchaseOrderDetail {
  id: number
  supplier_id: number
  total_amount: number
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
  supplier: {
    id: number
    name: string
    contact_person: string | null
    phone: string | null
    email: string | null
    address: string | null
  }
  profiles: {
    full_name: string | null
  } | null
}

export interface PurchaseOrderItem {
  id: number
  purchase_order_id: number
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  price_buy: number
  total: number
  created_at: string
  updated_at: string
  products: { name: string; code: string } | null
}

export interface InvoiceDetail {
  purchaseOrder: PurchaseOrderDetail
  items: PurchaseOrderItem[]
}

// Get purchase order detail with supplier information
export async function getPurchaseOrderDetail(purchaseOrderId: number): Promise<InvoiceDetail | null> {
  const supabase = await createClient()

  try {
    // Get purchase order with supplier information
    const { data: purchaseOrder, error: purchaseOrderError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        profiles(full_name)
      `)
      .eq('id', purchaseOrderId)
      .single()

    if (purchaseOrderError) {
      console.error('Error fetching purchase order:', purchaseOrderError)
      return null
    }

    if (!purchaseOrder) {
      return null
    }

    // Get purchase order items with product information
    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select(`
        *,
        product:products(name, code)
      `)
      .eq('purchase_order_id', purchaseOrderId)

    if (itemsError) {
      console.error('Error fetching purchase order items:', itemsError)
      return null
    }

    // Transform items to include product name and code
    const transformedItems: PurchaseOrderItem[] = (items || []).map(item => ({
      ...item,
      product_name: item.product?.name || 'Unknown Product',
      product_code: item.product?.code || 'N/A'
    }))

    return {
      purchaseOrder: purchaseOrder as PurchaseOrderDetail,
      items: transformedItems
    }
  } catch (error) {
    console.error('Error in getPurchaseOrderDetail:', error)
    return null
  }
}

// Update purchase order status
export async function updatePurchaseOrderStatus(
  purchaseOrderId: number,
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled'
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('purchase_orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseOrderId)

    if (error) {
      console.error('Error updating purchase order status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updatePurchaseOrderStatus:', error)
    return false
  }
}

// Get all purchase orders for current user
export async function getPurchaseOrders(): Promise<PurchaseOrderDetail[]> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        profiles(full_name)
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase orders:', error)
      return []
    }

    return (data || []) as PurchaseOrderDetail[]
  } catch (error) {
    console.error('Error in getPurchaseOrders:', error)
    return []
  }
}