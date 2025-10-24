import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Clock, User, Package, TrendingUp, TrendingDown } from "lucide-react"
import type { StockLog } from "./stock-log"

export const stockLogColumns: ColumnDef<StockLog>[] = [
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
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 mb-1 text-gray-400" />
            <div className="text-sm">
              {date.toLocaleDateString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "product",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produk
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const product = row.original.product
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Package className="h-4 w-4 mb-1 text-gray-400" />
            <div className="text-sm font-medium">
              {product?.name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {product?.code}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "quantity_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Perubahan Stock
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const quantity = row.original.quantity
      const type = row.original.type
      const isStockIn = type === 'in'

      return (
        <div className="text-center">
          <Badge
            variant={isStockIn ? "default" : "destructive"}
            className={`${
              isStockIn
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-1">
              {isStockIn ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isStockIn ? 'Masuk' : 'Keluar'} {quantity}
            </div>
          </Badge>
        </div>
      )
    },
  },
  {
    id: "user_profile",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const userProfile = row.original.user_profile
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <User className="h-4 w-4 mb-1 text-gray-400" />
            <div className="text-sm font-medium">
              {userProfile?.full_name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">
              {userProfile?.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "reason",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Alasan
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center text-sm">
        {row.getValue("reason") || '-'}
      </div>
    ),
  },
  {
    accessorKey: "price_buy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Harga Beli
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("price_buy") as number
      return (
        <div className="text-center font-mono text-sm">
          {price ? `Rp ${price.toLocaleString('id-ID')}` : '-'}
        </div>
      )
    },
  },
]