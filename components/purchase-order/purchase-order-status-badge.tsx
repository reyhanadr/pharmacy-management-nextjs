import React from 'react'

interface PurchaseOrderStatusBadgeProps {
  status: string
  className?: string
}

export function PurchaseOrderStatusBadge({ status, className = '' }: PurchaseOrderStatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
      case 'received':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 print:bg-gray-100 print:text-gray-700 print:border-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu'
      case 'approved':
        return 'Disetujui'
      case 'completed':
        return 'Selesai'
      case 'received':
        return 'Diterima'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles(status)} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}