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

export async function getSuppliers() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching suppliers:', error)
      throw new Error('Gagal mengambil data supplier')
    }

    return data || []
  } catch (error) {
    console.error('Error in getSuppliers:', error)
    throw new Error('Terjadi kesalahan saat mengambil data supplier')
  }
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

export async function addProduct(productData: {
  name: string
  code: string
  category: string | null
  price_buy: number
  price_sell: number
  stock: number
  supplier_id: number | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        code: productData.code,
        category: productData.category,
        price_buy: productData.price_buy,
        price_sell: productData.price_sell,
        stock: productData.stock,
        supplier_id: productData.supplier_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding product:', error)
      return { success: false, error: error.message }
    }

    // Revalidate the inventory list page
    revalidatePath('/inventory/inventory-list')

    return { success: true }
  } catch (error) {
    console.error('Error in addProduct:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan produk'
    }
  }
}

export async function updateProduct(productId: number, productData: {
  name: string
  code: string
  category: string | null
  price_buy: number
  price_sell: number
  stock: number
  supplier_id: number | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        code: productData.code,
        category: productData.category,
        price_buy: productData.price_buy,
        price_sell: productData.price_sell,
        stock: productData.stock,
        supplier_id: productData.supplier_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    }

    // Revalidate the inventory list page
    revalidatePath('/inventory/inventory-list')

    return { success: true }
  } catch (error) {
    console.error('Error in updateProduct:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate produk'
    }
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

  console.log('Attempting to delete products with IDs:', productIds)

  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)
      .select()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Error deleting multiple products:', error)
      return { success: false, error: 'Gagal menghapus produk terpilih' }
    }

    console.log('Products deleted successfully')

    revalidatePath('/inventory/inventory-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteMultipleProducts:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus produk terpilih' }
  }
}
