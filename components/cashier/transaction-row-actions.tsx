import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Eye, MoreHorizontal } from "lucide-react"

export interface Transaction {
  id: number
  user_id: string
  date: string
  total: number
  payment_method: 'cash' | 'card' | 'digital'
  items: {
    id: number
    name: string
    quantity: number
    price: number
  }[]
  status: 'completed' | 'cancelled'
}

// Actions cell component that will be used in the table
export function TransactionRowActions({ transaction, onDetail }: {
  transaction: Transaction;
  onDetail: (id: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(`Transaction #${transaction.id}`)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Salin ID Transaksi
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDetail(transaction.id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Detail Transaksi
        </DropdownMenuItem>
        {/* Future: Add print receipt, cancel transaction, etc. */}
        {/* <DropdownMenuItem>
          <Receipt className="mr-2 h-4 w-4" />
          Cetak Struk
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}