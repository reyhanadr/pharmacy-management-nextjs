"use server"

import { createClient } from '@/utils/supabase/server'
import type { StockLog } from './stock-log'

export async function getStockLogs(limit: number = 100): Promise<StockLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('stock_logs')
      .select(`
        *,
        product:products(name, code),
        user_profile:profiles(full_name, email)
      `)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as StockLog[]
  } catch (error) {
    console.error('Error fetching stock logs:', error)
    throw new Error('Failed to fetch stock logs')
  }
}

export async function getStockLogsByUser(userId: string, limit: number = 100): Promise<StockLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('stock_logs')
      .select(`
        *,
        product:products(name, code),
        user_profile:profiles(full_name, email)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as StockLog[]
  } catch (error) {
    console.error('Error fetching user stock logs:', error)
    throw new Error('Failed to fetch user stock logs')
  }
}

export async function getStockLogsByDateRange(startDate: string, endDate: string): Promise<StockLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('stock_logs')
      .select(`
        *,
        product:products(name, code),
        user_profile:profiles(full_name, email)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data as StockLog[]
  } catch (error) {
    console.error('Error fetching stock logs by date range:', error)
    throw new Error('Failed to fetch stock logs by date range')
  }
}

export async function getStockLogsByProduct(productId: number, limit: number = 100): Promise<StockLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('stock_logs')
      .select(`
        *,
        product:products(name, code),
        user_profile:profiles(full_name, email)
      `)
      .eq('product_id', productId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as StockLog[]
  } catch (error) {
    console.error('Error fetching stock logs by product:', error)
    throw new Error('Failed to fetch stock logs by product')
  }
}
