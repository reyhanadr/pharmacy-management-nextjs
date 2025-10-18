/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown } from "lucide-react"
import { InventoryRowActions } from "./inventory-row-actions"

export interface Product {
  id: number
  code: string
  name: string
  category: string | null
  stock: number
  price_buy: number
  price_sell: number
  supplier_name?: string | null
  created_at: string
  updated_at: string
}

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Pilih ${row.getValue("name")}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kode Produk
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Produk
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kategori
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("category") || "Tidak ada kategori"}</div>,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stok
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number
      return <div className={stock < 10 ? "text-red-600 font-medium" : ""}>{stock}</div>
    },
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
      const amount = parseFloat(row.getValue("price_buy"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
      return <div>Rp {formatted.replace("Rp", "").trim()}</div>
    },
  },
  {
    accessorKey: "price_sell",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Harga Jual
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price_sell"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
      return <div>Rp {formatted.replace("Rp", "").trim()}</div>
    },
  },
  {
    accessorKey: "supplier_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("supplier_name") || "Tidak ada supplier"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const product = row.original

      // Get the handlers from the table's meta
      const handleDelete = (table.options.meta as any)?.handleDeleteProduct
      const handleView = (table.options.meta as any)?.handleViewProduct
      const handleEdit = (table.options.meta as any)?.handleEditProduct

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <InventoryRowActions
            product={product}
            onDetail={handleView ? () => handleView(product.id) : () => {}}
            onEdit={handleEdit ? () => handleEdit(product.id) : () => {}}
            onDelete={handleDelete ? () => handleDelete(product.id) : () => {}}
          />
        </div>
      )
    },
  },
]