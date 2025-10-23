"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Receipt, Package, CreditCard, Clock } from "lucide-react"
import type { Transaction } from "@/components/cashier/cashier-action"
import type { Product } from "@/components/cashier/cashier-action"

interface TransactionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  products: Product[]
}

export function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
  products,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      cash: { variant: "default" as const, label: "Tunai", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      card: { variant: "secondary" as const, label: "Kartu", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      digital: { variant: "outline" as const, label: "Digital", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" }
    }
    const config = variants[method as keyof typeof variants] || variants.cash
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, label: "Selesai", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      cancelled: { variant: "destructive" as const, label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[status as keyof typeof variants] || variants.completed
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  // Get product details for items
  const getProductDetails = (productId: number) => {
    return products.find(p => p.id === productId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto ">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5" />
            Detail Transaksi #{transaction.id}
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang transaksi penjualan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Transaction Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Transaksi
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">ID Transaksi:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{transaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Tanggal:</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Metode Bayar:</span>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {getPaymentMethodBadge(transaction.payment_method)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Ringkasan
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Jumlah Item:</span>
                    <span className="font-semibold">{transaction.items.length} produk</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(transaction.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Items */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Detail Item
            </h3>
            <div className="space-y-3">
              {transaction.items.map((item, index) => {
                const product = getProductDetails(item.product_id)
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {product?.code || item.product_code}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Harga Satuan:</span> {formatCurrency(item.price_sell)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Transaction Timeline */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Riwayat
            </h3>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs font-medium text-muted-foreground">Dibuat:</span>
                <p className="text-sm">{formatDate(transaction.date)}</p>
              </div>
            </div>
          </div>

          {/* Future: Add action buttons for print receipt, cancel transaction, etc. */}
          {/* <Separator />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Cetak Struk
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}