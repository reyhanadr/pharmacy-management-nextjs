"use client"

import React, { useState, useEffect } from 'react'
import { Search, Trash2, ShoppingCart, CreditCard, DollarSign, Smartphone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createTransaction, getProducts, type Product, type TransactionItem, type Transaction, type UserProfile } from './cashier-action'
import { TransactionConfirmationModal } from './cashier-confirmation-modal'
import { formatCurrency } from '@/components/utils/format-currency'

interface CashierFormProps {
  initialProducts?: Product[]
  userData?: UserProfile
  onTransactionComplete?: (transaction: Transaction) => void
}

export function CashierForm({ initialProducts = [], userData, onTransactionComplete }: CashierFormProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<TransactionItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Load products on component mount (only if initialProducts is empty)
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadProducts()
    }
  }, [initialProducts])

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal memuat produk')
    }
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product_id === product.id)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart]
      const currentQty = updatedCart[existingItemIndex].quantity
      const newQty = currentQty + quantity

      if (newQty > product.stock) {
        setError(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`)
        return
      }

      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: newQty,
        total: newQty * product.price_sell
      }
      setCart(updatedCart)
    } else {
      // Add new item
      if (quantity > product.stock) {
        setError(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`)
        return
      }

      const newItem: TransactionItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: quantity,
        price_sell: product.price_sell,
        total: quantity * product.price_sell
      }
      setCart([...cart, newItem])
    }
    setError(null)
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product || quantity > product.stock) {
      setError(`Stok tidak mencukupi. Stok tersedia: ${product?.stock || 0}`)
      return
    }

    const updatedCart = cart.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          quantity: quantity,
          total: quantity * item.price_sell
        }
      }
      return item
    })
    setCart(updatedCart)
    setError(null)
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      setError('Keranjang masih kosong')
      return
    }

    setShowConfirmation(true)
  }

  const updateStockOptimistically = (soldItems: TransactionItem[]) => {
    // Optimistic update: immediately update stock in UI for better UX
    // This makes the app feel faster and shows immediate stock changes
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const soldItem = soldItems.find(item => item.product_id === product.id)
        if (soldItem) {
          const newStock = Math.max(0, product.stock - soldItem.quantity)
          return { ...product, stock: newStock }
        }
        return product
      })
    )
  }

  const handleConfirmTransaction = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!userData) {
        throw new Error('Anda harus masuk untuk membuat transaksi')
      }

      const transaction = await createTransaction(cart, paymentMethod, userData.id)

      // Optimistic update: immediately update stock in the UI
      updateStockOptimistically(cart)

      // Reset form
      setCart([])
      setPaymentMethod('cash')
      setSearchTerm('')
      setShowConfirmation(false)

      // Notify parent component
      if (onTransactionComplete) {
        onTransactionComplete(transaction)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal membuat transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethodOptions = [
    { value: 'cash', label: 'Tunai', icon: DollarSign, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'card', label: 'Kartu', icon: CreditCard, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'digital', label: 'Digital', icon: Smartphone, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Transaksi Baru
          </CardTitle>
          <CardDescription>
            Pilih produk dan lengkapi transaksi kasir
            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className='mt-4'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Cari Produk</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama atau kode produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-2">
              <Label>Daftar Produk</Label>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {searchTerm ? 'Produk tidak ditemukan' : 'Memuat produk...'}
                    </p>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Kode: {product.code} | Stok: {product.stock} | Harga: {formatCurrency(product.price_sell)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product, 1)}
                            disabled={product.stock <= 0}
                            className='cursor-pointer'
                          >
                            <Plus className="h-4 w-4" />
                            1
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addToCart(product, 5)}
                            disabled={product.stock < 5}
                            className='cursor-pointer'
                          >
                            <Plus className="h-4 w-4" />
                            5
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            {cart.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Keranjang Belanja</Label>
                  <Badge variant="secondary">{cart.length} item</Badge>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Produk</TableHead>
                        <TableHead className="text-left">Kode</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.product_code}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className='cursor-pointer'
                                onClick={() => updateCartQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className='cursor-pointer'
                                onClick={() => {
                                  const product = products.find(p => p.id === item.product_id)
                                  if (product) {
                                    updateCartQuantity(item.product_id, Math.min(product.stock, item.quantity + 1))
                                  }
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price_sell)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className='cursor-pointer'
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="text-xl font-bold">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethodOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={paymentMethod === option.value ? "default" : "outline"}
                      className={`flex flex-col items-center gap-2 h-auto p-4 cursor-pointer ${paymentMethod === option.value ? '' : option.color}`}
                      onClick={() => setPaymentMethod(option.value as 'cash' | 'card' | 'digital')}
                    >
                      <option.icon className="h-5 w-5" />
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading || cart.length === 0}
                className="px-8 cursor-pointer"
              >
                <CreditCard className="h-5 w-5" />
                {isLoading ? 'Memproses...' : 'Proses Transaksi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <TransactionConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmTransaction}
        items={cart}
        total={calculateTotal()}
        paymentMethod={paymentMethod}
        isLoading={isLoading}
      />
    </div>
  )
}