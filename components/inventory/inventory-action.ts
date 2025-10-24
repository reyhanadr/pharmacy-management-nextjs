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
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return { success: false, error: 'User not authenticated' }
    }

    // Check user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return { success: false, error: 'User profile not found' }
    }

    console.log('Updating product', productId, 'for user:', user.id, 'with role:', profile.role)

    // Check if user has permission to update products
    if (profile.role !== 'owner') {
      console.error('Access denied: User role', profile.role, 'cannot update products')
      return { success: false, error: 'Access denied: Insufficient permissions to update products' }
    }

    // First check if the product exists and user has access
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (checkError || !existingProduct) {
      console.error('Product not found or access denied:', checkError)
      return { success: false, error: 'Product not found or access denied' }
    }

    // Update the product
    const { data, error } = await supabase
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
      .select()

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
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return { success: false, error: 'User not authenticated' }
    }

    // Check user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return { success: false, error: 'User profile not found' }
    }

    console.log('Deleting product', productId, 'for user:', user.id, 'with role:', profile.role)

    // Check if user has permission to delete products
    if (profile.role !== 'owner') {
      console.error('Access denied: User role', profile.role, 'cannot delete products')
      return { success: false, error: 'Access denied: Insufficient permissions to delete products' }
    }

    // First check if the product exists and user has access
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (checkError || !existingProduct) {
      console.error('Product not found or access denied:', checkError)
      return { success: false, error: 'Product not found or access denied' }
    }

    // Delete without select to avoid RLS issues
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    console.log('Product deleted successfully')

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
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return { success: false, error: 'User not authenticated' }
    }

    // Check user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return { success: false, error: 'User profile not found' }
    }

    console.log('Deleting products', productIds, 'for user:', user.id, 'with role:', profile.role)

    // Check if user has permission to delete products
    if (profile.role !== 'owner') {
      console.error('Access denied: User role', profile.role, 'cannot delete products')
      return { success: false, error: 'Access denied: Insufficient permissions to delete products' }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)

    if (error) {
      console.error('Error deleting multiple products:', error)
      return { success: false, error: error.message }
    }

    console.log('Products deleted successfully')

    revalidatePath('/inventory/inventory-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteMultipleProducts:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus produk terpilih' }
  }
}
