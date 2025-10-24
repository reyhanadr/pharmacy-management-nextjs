"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, ShoppingCart, Truck, CheckCircle, XCircle, Printer, Eye } from "lucide-react"
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDate } from "@/components/utils/format-date"
import { PurchaseOrderConfirmationModal } from "./purchase-order-confirmation"
import { useRouter } from "next/navigation"

export interface PurchaseOrderResponse {
  id: number
  supplier_id: number
  total_amount: number
  status: 'pending' | 'approved' | 'completed' | 'received' | 'canceled'
  created_at: string
  created_by: string
  suppliers: { name: string } | null
  profiles: { full_name: string } | null
  purchase_order_items: Array<{
    id: number
    purchase_order_id: number
    product_id: number
    quantity: number
    price_buy: number
    total: number
    products: { name: string; code: string } | null
  }>
}

interface PurchaseOrderDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrderResponse | null
  onStatusUpdate?: () => void
}

export function PurchaseOrderDetailModal({
  open,
  onOpenChange,
  purchaseOrder,
  onStatusUpdate,
}: PurchaseOrderDetailModalProps) {
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean
    action: 'receive' | 'cancel' | null
    purchaseOrder: PurchaseOrderResponse | null
  }>({
    open: false,
    action: null,
    purchaseOrder: null
  })

  const router = useRouter()

  if (!purchaseOrder) return null

  const handleReceive = () => {
    setConfirmationModal({
      open: true,
      action: 'receive',
      purchaseOrder
    })
  }

  const handleCancel = () => {
    setConfirmationModal({
      open: true,
      action: 'cancel',
      purchaseOrder
    })
  }

  const handleModalClose = () => {
    setConfirmationModal({
      open: false,
      action: null,
      purchaseOrder: null
    })
  }

  const handleStatusUpdateSuccess = () => {
    onStatusUpdate?.()
    handleModalClose()
  }

  const handleViewInvoice = () => {
    router.push(`/supplier/manage-purchase-order/invoice/${purchaseOrder.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Detail Purchase Order
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang purchase order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Purchase Order Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Purchase Order Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Purchase Order
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">No. PO:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-right">
                      PO-{String(purchaseOrder.id).padStart(4, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Supplier:</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Truck className="h-3 w-3" />
                      <span className="font-medium">{purchaseOrder.suppliers?.name || "Tidak ada supplier"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <div className="flex items-center">
                      <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Dibuat Oleh:</span>
                    <span className="text-sm">{purchaseOrder.profiles?.full_name || purchaseOrder.created_by}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Ringkasan
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Jumlah Item:</span>
                    <span className="font-semibold">{purchaseOrder.purchase_order_items?.length || 0} item{(purchaseOrder.purchase_order_items?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Amount:</span>
                    <span className="font-bold text-lg text-green-800 dark:text-green-200 text-right min-w-0 break-words">
                      {formatCurrency(purchaseOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Purchase Order Items */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Item yang Dipesan
            </h3>
            <div className="space-y-2">
              {purchaseOrder.purchase_order_items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.products?.name || `Produk ${item.product_id}`}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.products?.code || 'Tidak ada kode'} | Qty: {item.quantity} | Harga: {formatCurrency(item.price_buy)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.total)}</div>
                  </div>
                </div>
              ))}
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
                  <p className="text-sm">{formatDate(purchaseOrder.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="default"
              className="cursor-pointer"
              onClick={handleViewInvoice}
            >
              <Eye className="h-4 w-4" />
              Lihat Invoice
            </Button>
            {(purchaseOrder.status === 'pending' || purchaseOrder.status === 'approved') && (
              <Button
                className="cursor-pointer bg-green-600 hover:bg-green-700"
                onClick={handleReceive}
              >
                <CheckCircle className="h-4 w-4" />
                Terima Barang
              </Button>
            )}
            {(purchaseOrder.status === 'pending' || purchaseOrder.status === 'approved') && (
              <Button
                className="cursor-pointer bg-red-600 hover:bg-red-700"
                onClick={handleCancel}
              >
                <XCircle className="h-4 w-4" />
                Batalkan PO
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      <PurchaseOrderConfirmationModal
        open={confirmationModal.open}
        onOpenChange={handleModalClose}
        purchaseOrder={confirmationModal.purchaseOrder ? {
          id: confirmationModal.purchaseOrder.id,
          supplier_name: confirmationModal.purchaseOrder.suppliers?.name || undefined,
          total_amount: confirmationModal.purchaseOrder.total_amount,
          status: confirmationModal.purchaseOrder.status
        } : null}
        action={confirmationModal.action}
        onSuccess={handleStatusUpdateSuccess}
      />
    </Dialog>
  )
}