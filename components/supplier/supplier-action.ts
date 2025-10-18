'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Supplier = {
  id: number
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

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

export async function addSupplier(supplierData: {
  name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('suppliers')
      .insert({
        name: supplierData.name,
        contact_person: supplierData.contact_person || null,
        phone: supplierData.phone || null,
        email: supplierData.email || null,
        address: supplierData.address || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding supplier:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/supplier/supplier-list')
    return { success: true }
  } catch (error) {
    console.error('Error in addSupplier:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan supplier'
    }
  }
}

export async function updateSupplier(supplierId: number, supplierData: {
  name?: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('suppliers')
      .update({
        ...supplierData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supplierId)

    if (error) {
      console.error('Error updating supplier:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/supplier/supplier-list')
    return { success: true }
  } catch (error) {
    console.error('Error in updateSupplier:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate supplier'
    }
  }
}

export async function deleteSupplier(supplierId: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId)

    if (error) {
      console.error('Error deleting supplier:', error)
      return { success: false, error: 'Gagal menghapus supplier' }
    }

    revalidatePath('/supplier/supplier-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteSupplier:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus supplier' }
  }
}

export async function deleteMultipleSuppliers(supplierIds: number[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  console.log('Attempting to delete suppliers with IDs:', supplierIds)

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .delete()
      .in('id', supplierIds)
      .select()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Error deleting multiple suppliers:', error)
      return { success: false, error: 'Gagal menghapus supplier terpilih' }
    }

    console.log('Suppliers deleted successfully')

    revalidatePath('/supplier/supplier-list')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteMultipleSuppliers:', error)
    return { success: false, error: 'Terjadi kesalahan saat menghapus supplier terpilih' }
  }
}
