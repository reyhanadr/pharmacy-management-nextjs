'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Product = {
  id: number
  name: string
  code: string
  price_buy: number
  price_sell: number
  stock: number
  category: string | null
  supplier_id: number | null
  supplier_name?: string | null
  created_at: string
  updated_at: string
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        code,
        price_buy,
        price_sell,
        stock,
        category,
        supplier_id,
        suppliers!supplier_id (
          name
        ),
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error('Gagal mengambil data produk')
    }

    // Process supplier data from joined query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedData = (data || []).map((product: any): Product => ({
      ...product,
      supplier_name: product.suppliers?.name || null
    }))

    return processedData
  } catch (error) {
    console.error('Error in getProducts:', error)
    throw new Error('Terjadi kesalahan saat mengambil data produk')
  }
}

export async function deleteProduct(productId: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: 'Gagal menghapus produk' }
    }

    revalidatePath('/inventory/inventory-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteProduct:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus produk' }
  }
}

export async function deleteMultipleProducts(productIds: number[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)

    if (error) {
      console.error('Error deleting multiple products:', error)
      return { success: false, error: 'Gagal menghapus produk terpilih' }
    }

    revalidatePath('/inventory/inventory-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteMultipleProducts:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus produk terpilih' }
  }
}