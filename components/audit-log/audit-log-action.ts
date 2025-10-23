"use server"

import { createClient } from '@/utils/supabase/server'

export interface AuditLog {
  id: number
  user_id: string
  action_type: 'insert' | 'update' | 'delete'
  table_name: string
  record_id: number | null
  details: Record<string, unknown>
  created_at: string
  user_profile?: {
    full_name: string
    email: string
  }
}

export interface StockLog {
  id: number
  product_id: number
  quantity: number
  type: 'in' | 'out'
  date: string
  user_id: string
  reason: string | null
  price_buy: number | null
  product?: {
    name: string
    code: string
  }
  user_profile?: {
    full_name: string
    email: string
  }
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as AuditLog[]
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw new Error('Failed to fetch audit logs')
  }
}

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

export async function getAuditLogsByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:profiles(full_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as AuditLog[]
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    throw new Error('Failed to fetch user audit logs')
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

export async function getAuditLogsByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:profiles(full_name, email)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as AuditLog[]
  } catch (error) {
    console.error('Error fetching audit logs by date range:', error)
    throw new Error('Failed to fetch audit logs by date range')
  }
}