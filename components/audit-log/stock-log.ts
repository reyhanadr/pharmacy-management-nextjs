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
