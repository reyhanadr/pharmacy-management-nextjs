import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"

export interface Product {
  id: number
  code: string
  name: string
  category: string | null
  stock: number
  price_buy: number
  price_sell: number
  created_at: string
  updated_at: string
}

// Actions cell component that will be used in the table
export function InventoryRowActions({ product, onDetail, onEdit, onDelete }: { product: Product; onDetail: (id: number) => void; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
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
          onClick={() => navigator.clipboard.writeText(product.name)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Salin Nama Produk
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDetail(product.id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(product.id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}