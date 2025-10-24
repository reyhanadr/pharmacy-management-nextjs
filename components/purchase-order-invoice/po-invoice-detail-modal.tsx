'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, MapPin, Phone, Mail, User, Package, DollarSign } from 'lucide-react'
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDate } from "@/components/utils/format-date"
import {
  getPurchaseOrderDetail,
  type InvoiceDetail
} from '@/components/purchase-order-invoice/po-invoice-action'
import { PurchaseOrderStatusBadge } from '@/components/purchase-order/purchase-order-status-badge'

interface InvoiceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrderId: number | null
}

export function InvoiceDetailModal({
  open,
  onOpenChange,
  purchaseOrderId,
}: InvoiceDetailModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const loadInvoiceDetail = useCallback(async () => {
    if (!purchaseOrderId) return

    setLoading(true)
    try {
      const data = await getPurchaseOrderDetail(purchaseOrderId)
      setInvoiceData(data)
    } catch (error) {
      console.error('Error loading invoice detail:', error)
    } finally {
      setLoading(false)
    }
  }, [purchaseOrderId])

  useEffect(() => {
    if (open && purchaseOrderId) {
      loadInvoiceDetail()
    }
  }, [open, purchaseOrderId, loadInvoiceDetail])

  if (!invoiceData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Purchase Order</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Data tidak ditemukan</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  const { purchaseOrder, items } = invoiceData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Purchase Order #{purchaseOrder.id}</span>
            <PurchaseOrderStatusBadge status={purchaseOrder.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Purchase Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informasi Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Tanggal Dibuat:</Label>
                  <span className="text-sm">{formatDate(purchaseOrder.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Terakhir Diubah:</Label>
                  <span className="text-sm">{formatDate(purchaseOrder.updated_at)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Total Amount:</Label>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(purchaseOrder.total_amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nama Supplier:</Label>
                  <p className="text-sm font-medium">{purchaseOrder.supplier.name}</p>
                </div>
                {purchaseOrder.supplier.contact_person && (
                  <div>
                    <Label className="text-sm font-medium">Contact Person:</Label>
                    <p className="text-sm">{purchaseOrder.supplier.contact_person}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {purchaseOrder.supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{purchaseOrder.supplier.phone}</span>
                  </div>
                )}
                {purchaseOrder.supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{purchaseOrder.supplier.email}</span>
                  </div>
                )}
                {purchaseOrder.supplier.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{purchaseOrder.supplier.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detail Item
              </CardTitle>
              <CardDescription>
                Daftar produk yang dipesan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Produk</TableHead>
                      <TableHead className="text-left">Kode</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga Beli</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell>{item.product_code}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price_buy)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              {/* Total Summary */}
              <div className="flex justify-end">
                <div className="bg-muted/50 rounded-lg p-4 min-w-[200px]">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatCurrency(purchaseOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}