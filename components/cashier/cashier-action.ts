"use server"

import { createClient } from '@/utils/supabase/server'

export interface TransactionItem {
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  price_sell: number
  total: number
}

export interface Transaction {
  id: number
  user_id: string
  date: string
  total: number
  payment_method: 'cash' | 'card' | 'digital'
  items: TransactionItem[]
  status: 'completed' | 'cancelled'
}

export interface Product {
  id: number
  name: string
  code: string
  price_sell: number
  stock: number
  category: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: string
}

export async function getProducts() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('name')

    if (error) throw error
    return data as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
}

export async function getUserData() {
  const supabase = await createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    return { ...user, ...profile } as UserProfile
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw new Error('Failed to fetch user data')
  }
}

export async function createTransaction(
  items: TransactionItem[],
  paymentMethod: 'cash' | 'card' | 'digital',
  userId: string
): Promise<Transaction> {
  const supabase = await createClient()

  try {
    // Validate items before creating transaction
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.product_name}: ${item.quantity}`)
      }
      if (!item.product_id) {
        throw new Error(`Missing product_id for product ${item.product_name}`)
      }
    }

    const total = items.reduce((sum, item) => sum + item.total, 0)

    console.log('Creating transaction with items:', items)
    console.log('Total:', total)

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        total: total,
        payment_method: paymentMethod,
        items: items,
        status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Transaction created successfully:', data)

    // The triggers will automatically:
    // 1. Log the transaction in audit_logs
    // 2. Update stock via stock_logs and update_product_stock trigger
    // Note: Make sure your trigger uses the correct field names:
    // FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(product_id int, quantity int)

    return data as Transaction
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw new Error('Failed to create transaction')
  }
}

export async function getTransactionHistory(userId?: string) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(50)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Transaction[]
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    throw new Error('Failed to fetch transaction history')
  }
}