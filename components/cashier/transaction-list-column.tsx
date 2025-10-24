/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, CreditCard, DollarSign, Smartphone, CheckCircle2, XCircle } from "lucide-react"
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDateLong } from "@/components/utils/format-date"
import { TransactionRowActions } from "./transaction-row-actions"

export interface Transaction {
  id: number
  user_id: string
  date: string
  total: number
  payment_method: 'cash' | 'card' | 'digital'
  items: any[]
  status: 'completed' | 'cancelled'
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Transaksi
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">TRX-{String(row.getValue("id")).padStart(4, '0')}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string
      return <div className="whitespace-nowrap font-medium">{formatDateLong(date)}</div>
    },
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Metode Bayar
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const method = row.getValue("payment_method") as string

      const getPaymentMethodBadge = (method: string) => {
        const variants = {
          cash: {
            variant: "default" as const,
            label: "Tunai",
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            icon: DollarSign
          },
          card: {
            variant: "secondary" as const,
            label: "Kartu",
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            icon: CreditCard
          },
          digital: {
            variant: "outline" as const,
            label: "Digital",
            color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            icon: Smartphone
          }
        }
        const config = variants[method as keyof typeof variants] || variants.cash
        const IconComponent = config.icon
        return (
          <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 text-xs`}>
            <IconComponent className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      }

      return getPaymentMethodBadge(method)
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      const getStatusBadge = (status: string) => {
        const variants = {
          completed: {
            variant: "default" as const,
            label: "Selesai",
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            icon: CheckCircle2
          },
          cancelled: {
            variant: "destructive" as const,
            label: "Dibatalkan",
            color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            icon: XCircle
          }
        }
        const config = variants[status as keyof typeof variants] || variants.completed
        const IconComponent = config.icon
        return (
          <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 text-xs`}>
            <IconComponent className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      }

      return getStatusBadge(status)
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      return <div className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "item_count",
    header: "Jumlah Item",
    cell: ({ row }) => {
      const items = row.original.items
      return <div className="font-medium">{items?.length || 0} produk</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const transaction = row.original

      const handleView = (table.options.meta as { handleViewTransaction?: (id: number) => void })?.handleViewTransaction

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <TransactionRowActions
            transaction={transaction}
            onDetail={handleView ? () => handleView(transaction.id) : () => {}}
          />
        </div>
      )
    },
  },
]