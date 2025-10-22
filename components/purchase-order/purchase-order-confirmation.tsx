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
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { receivePurchaseOrder, cancelPurchaseOrder } from "./purchase-order-action"

interface PurchaseOrderConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: {
    id: number
    supplier_name?: string
    total_amount: number
    status: string
  } | null
  action: 'receive' | 'cancel' | null
  onSuccess?: () => void
}

export function PurchaseOrderConfirmationModal({
  open,
  onOpenChange,
  purchaseOrder,
  action,
  onSuccess
}: PurchaseOrderConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const handleConfirm = async () => {
    if (!purchaseOrder || !action) return

    setIsLoading(true)
    console.log(purchaseOrder)

    try {
      // Add delay to ensure proper processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (action === 'receive') {
        await receivePurchaseOrder(purchaseOrder.id)
        toast.success(`Purchase Order berhasil diterima dan stok telah ditambahkan ke inventory`)
      } else if (action === 'cancel') {
        await cancelPurchaseOrder(purchaseOrder.id)
        toast.success(`Purchase Order berhasil dibatalkan`)
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error(`Error ${action === 'receive' ? 'receiving' : 'canceling'} purchase order:`, error)
      toast.error(error instanceof Error ? error.message : `Gagal ${action === 'receive' ? 'menerima' : 'membatalkan'} purchase order`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!purchaseOrder || !action) return null

  const isReceiveAction = action === 'receive'
  const isCancelAction = action === 'cancel'

  const getModalContent = () => {
    if (isReceiveAction) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        title: "Konfirmasi Penerimaan Barang",
        description: `Apakah Anda yakin ingin menandai Purchase Order ini sebagai "Diterima"? Stok barang akan otomatis ditambahkan ke inventory.`,
        confirmText: "Terima Barang",
        confirmButtonClass: "bg-green-600 hover:bg-green-700"
      }
    } else if (isCancelAction) {
      return {
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        title: "Konfirmasi Pembatalan",
        description: `Apakah Anda yakin ingin membatalkan Purchase Order ini? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: "Batalkan PO",
        confirmButtonClass: "bg-red-600 hover:bg-red-700"
      }
    }
    return {}
  }

  const modalContent = getModalContent()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {modalContent.icon}
            <DialogTitle className="text-xl">
              {modalContent.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">No. Purchase Order:</span>
              <span className="font-medium">PO-{String(purchaseOrder.id).padStart(4, '0')}</span>
            </div>
            {purchaseOrder.supplier_name && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Supplier:</span>
                <span className="font-medium">{purchaseOrder.supplier_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Nilai:</span>
              <span className="font-medium">
                Rp {purchaseOrder.total_amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foregroundx">Status Saat Ini:</span>
              <PurchaseOrderStatusBadge status={purchaseOrder.status} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={modalContent.confirmButtonClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                {isReceiveAction && <CheckCircle className="mr-2 h-4 w-4" />}
                {isCancelAction && <XCircle className="mr-2 h-4 w-4" />}
                {modalContent.confirmText}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}