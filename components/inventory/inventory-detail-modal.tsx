"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Edit, Package, TrendingUp, Truck } from "lucide-react"
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDate } from "@/components/utils/format-date"

interface Product {
  id: number
  code: string
  name: string
  category: string | null
  stock: number
  price_buy: number
  price_sell: number
  supplier_name?: string | null
  created_at: string
  updated_at: string
}

interface InventoryDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onEdit?: () => void
}

export function InventoryDetailModal({
  open,
  onOpenChange,
  product,
  onEdit,
}: InventoryDetailModalProps) {
  if (!product) return null

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const }
    if (stock < 10) return { label: "Rendah", variant: "secondary" as const }
    return { label: "Tersedia", variant: "default" as const }
  }

  const stockStatus = getStockStatus(product.stock)
  const profitMargin = product.price_sell - product.price_buy
  const profitPercentage = product.price_buy > 0 ? (profitMargin / product.price_buy) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto ">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Detail Produk
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang produk inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Produk
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Kode:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-right">
                      {product.code}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Nama Produk:</span>
                    <p className="text-lg font-semibold mt-1">{product.name}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
                    <span className="text-sm px-2 py-1 bg-secondary rounded">
                      {product.category || "Tidak ada kategori"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Supplier:</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Truck className="h-3 w-3" />
                      <span>{product.supplier_name || "Tidak ada supplier"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stock & Pricing */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Status Stok
                </h3>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant={stockStatus.variant} className="text-xs">
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{product.stock}</div>
                    <div className="text-xs text-muted-foreground">unit tersedia</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Harga
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Harga Beli:</span>
                    <span className="font-semibold text-green-800 dark:text-green-200 text-right min-w-0 break-words">
                      {formatCurrency(product.price_buy)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Harga Jual:</span>
                    <span className="font-semibold text-blue-800 dark:text-blue-200 text-right min-w-0 break-words">
                      {formatCurrency(product.price_sell)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Margin:</span>
                    </div>
                    <div className="text-right min-w-0">
                      <div className="font-semibold text-green-800 dark:text-green-200 break-words">
                        {formatCurrency(profitMargin)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({profitPercentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Riwayat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Dibuat:</span>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Diperbarui:</span>
                  <p className="text-sm">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button className="cursor-pointer" variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Produk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}