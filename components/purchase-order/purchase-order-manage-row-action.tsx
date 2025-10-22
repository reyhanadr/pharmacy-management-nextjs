"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Eye, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react"
import { PurchaseOrderConfirmationModal } from "./purchase-order-confirmation"
import type { PurchaseOrderResponse } from "./purchase-order-action"

// Actions cell component that will be used in the table
export function PurchaseOrderManageRowActions({
  purchaseOrder,
  onDetail,
  onDelete,
  onStatusUpdate
}: {
  purchaseOrder: PurchaseOrderResponse
  onDetail: (id: number) => void
  onDelete: (id: number) => void
  onStatusUpdate?: () => void
}) {
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean
    action: 'receive' | 'cancel' | null
    purchaseOrder: PurchaseOrderResponse | null
  }>({
    open: false,
    action: null,
    purchaseOrder: null
  })

  const handleCopyPONumber = () => {
    navigator.clipboard.writeText(`PO-${String(purchaseOrder.id).padStart(4, '0')}`)
  }

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

  const handleDeleteClick = () => {
    // Just call the onDelete prop, the modal will be handled by the parent component
    onDelete(purchaseOrder.id)
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
    window.location.reload()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyPONumber}>
            <Copy className="mr-2 h-4 w-4" />
            Salin No. PO
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDetail(purchaseOrder.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Detail
          </DropdownMenuItem>
          {(purchaseOrder.status === 'pending' || purchaseOrder.status === 'approved') && (
            <DropdownMenuItem onClick={handleReceive} className="text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              Terima Barang
            </DropdownMenuItem>
          )}
          {(purchaseOrder.status === 'pending' || purchaseOrder.status === 'approved') && (
            <DropdownMenuItem onClick={handleCancel} className="text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              Batalkan PO
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={handleDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  )
}