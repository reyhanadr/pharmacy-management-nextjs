/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
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
          ID Transaksi
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">#{row.getValue("id")}</div>,
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
      const date = new Date(row.getValue("date"))
      return <div className="whitespace-nowrap">{date.toLocaleDateString("id-ID")}</div>
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
      const labels = {
        cash: "Tunai",
        card: "Kartu",
        digital: "Digital"
      }
      return <div className="font-medium">{labels[method as keyof typeof labels] || method}</div>
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
      const labels = {
        completed: "Selesai",
        cancelled: "Dibatalkan"
      }
      const colors = {
        completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }
      return (
        <div className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors] || colors.completed}`}>
          {labels[status as keyof typeof labels] || status}
        </div>
      )
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
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
      return <div className="font-semibold text-green-600">Rp {formatted.replace("Rp", "").trim()}</div>
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