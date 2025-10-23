"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, Smartphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TransactionItem {
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  price_sell: number
  total: number
}

interface TransactionConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  items: TransactionItem[]
  total: number
  paymentMethod: 'cash' | 'card' | 'digital'
  isLoading: boolean
}

const paymentMethodOptions = [
  { value: 'cash', label: 'Tunai', icon: DollarSign, color: 'bg-green-100 text-green-800' },
  { value: 'card', label: 'Kartu', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
  { value: 'digital', label: 'Digital', icon: Smartphone, color: 'bg-purple-100 text-purple-800' }
]

export function TransactionConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  items,
  total,
  paymentMethod,
  isLoading
}: TransactionConfirmationModalProps) {
  const paymentMethodInfo = paymentMethodOptions.find(opt => opt.value === paymentMethod)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <CreditCard className="h-5 w-5" />
            Konfirmasi Transaksi
          </DialogTitle>
          <DialogDescription>
            Pastikan semua detail transaksi sudah benar sebelum melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Items Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Item:</span>
              <Badge variant="secondary">{items.length} produk</Badge>
            </div>

            {items.slice(0, 3).map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {item.quantity} x Rp {item.price_sell.toLocaleString()}
                  </div>
                </div>
                <div className="font-medium">
                  Rp {item.total.toLocaleString()}
                </div>
              </div>
            ))}

            {items.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                ... dan {items.length - 3} produk lainnya
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Metode Pembayaran:</span>
              <div className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium ${paymentMethodInfo?.color || 'bg-gray-100 dark:bg-gray-800'} transition-all duration-200 hover:shadow-md`}>
                {paymentMethodInfo?.icon && <paymentMethodInfo.icon className="h-3 w-3" />}
                {paymentMethodInfo?.label || paymentMethod}
              </div>
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Pembayaran:</span>
              <span className="text-blue-600 dark:text-blue-400">Rp {total.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="min-w-32 cursor-pointer"
            >
              {isLoading ? 'Memproses...' : 'Konfirmasi Transaksi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}