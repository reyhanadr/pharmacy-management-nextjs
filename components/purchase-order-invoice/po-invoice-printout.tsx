'use client'

import React from 'react'
import { Separator } from '@/components/ui/separator'
import { MapPin, Phone, Mail, Building2, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  type InvoiceDetail,
  type PurchaseOrderItem
} from '@/components/purchase-order-invoice/po-invoice-action'
import { PurchaseOrderStatusBadge } from '@/components/purchase-order/purchase-order-status-badge'

interface InvoicePrintoutProps {
  purchaseOrder: InvoiceDetail
}

export function InvoicePrintout({ purchaseOrder }: InvoicePrintoutProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Transform InvoiceDetail to PurchaseOrderData structure for the printout
  const poData = {
    id: purchaseOrder.purchaseOrder.id,
    supplier_id: purchaseOrder.purchaseOrder.supplier_id,
    total_amount: purchaseOrder.purchaseOrder.total_amount,
    status: purchaseOrder.purchaseOrder.status,
    created_at: purchaseOrder.purchaseOrder.created_at,
    created_by: purchaseOrder.purchaseOrder.created_by,
    suppliers: purchaseOrder.purchaseOrder.supplier,
    profiles: purchaseOrder.purchaseOrder.profiles,
    purchase_order_items: purchaseOrder.items
  } as const

  return (
    <div
      className="invoice-printout max-w-4xl mx-auto p-8 bg-white text-black print:shadow-none"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
      }}
    >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">APOTEK FARMA</h1>
          </div>
          <p className="text-gray-600 mb-2">Jl. Raya No. 123, Jakarta</p>
          <p className="text-gray-600 mb-2">Tel: (021) 1234-5678 | Email: info@apotekfarma.com</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>PURCHASE ORDER</span>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">PO Number:</span>
                  <span className="font-mono">PO-{String(poData.id).padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(poData.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created By:</span>
                  <span>{poData.profiles?.full_name || poData.created_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <PurchaseOrderStatusBadge status={poData.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Supplier Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Supplier:</span>
                  <span className="font-medium">{poData.suppliers?.name || 'N/A'}</span>
                </div>
                {poData.suppliers?.contact_person && (
                  <div className="flex justify-between">
                    <span className="font-medium">Contact Person:</span>
                    <span>{poData.suppliers.contact_person}</span>
                  </div>
                )}
                {poData.suppliers?.phone && (
                  <div className="flex items-center justify-between gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{poData.suppliers.phone}</span>
                  </div>
                )}
                {poData.suppliers?.email && (
                  <div className="flex items-center justify-between gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-xs">{poData.suppliers.email}</span>
                  </div>
                )}
                {poData.suppliers?.address && (
                  <div className="flex items-start justify-between gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-xs text-right">{poData.suppliers.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-gray-300">
                  <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                    No
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                    Product Name
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                    Code
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">
                    Qty
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-300">
                    Unit Price
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-300">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poData.purchase_order_items?.map((item: PurchaseOrderItem, index: number) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 border-gray-200">
                    <TableCell className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      {item.products?.name || item.product_name || `Product ${item.product_id}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200 font-mono">
                      {item.products?.code || item.product_code || 'N/A'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 border-b border-gray-200">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-right text-gray-900 border-b border-gray-200">
                      {formatCurrency(item.price_buy)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-right font-medium text-gray-900 border-b border-gray-200">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total Items:</span>
                <span className="font-semibold">{poData.purchase_order_items?.length || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Grand Total:</span>
                <span className="text-green-600">{formatCurrency(poData.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-800 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payment due within 30 days of invoice date</li>
                <li>• Late payments may incur additional charges</li>
                <li>• Goods delivered subject to availability</li>
                <li>• All prices are exclusive of taxes</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Generated on: {formatDateTime(new Date().toISOString())}
                </div>
                <div className="text-xs text-gray-500">
                  This is a computer-generated document
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .invoice-printout {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    )
}