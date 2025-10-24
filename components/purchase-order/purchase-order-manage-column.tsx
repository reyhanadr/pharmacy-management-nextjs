/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown } from "lucide-react"
import { PurchaseOrderManageRowActions } from "./purchase-order-manage-row-action"
import { PurchaseOrderResponse } from "./purchase-order-action"
import { formatCurrency } from "@/components/utils/format-currency"

export type { PurchaseOrderResponse }

export const columns: ColumnDef<PurchaseOrderResponse>[] = [
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
        aria-label={`Pilih PO-${row.getValue("id")}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. PO
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        PO-{String(row.getValue("id")).padStart(4, '0')}
      </div>
    ),
  },
  {
    accessorKey: "suppliers",
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
    cell: ({ row }) => {
      const suppliers = row.getValue("suppliers") as { name: string } | null
      return <div className="font-medium">{suppliers?.name || "Tidak ada supplier"}</div>
    },
  },
  {
    accessorKey: "created_at",
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
      const date = new Date(row.getValue("created_at"))
      return <div className="whitespace-nowrap">{date.toLocaleDateString("id-ID")}</div>
    },
  },
  {
    id: "item_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jumlah Item
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const purchaseOrder = row.original
      const itemCount = purchaseOrder.purchase_order_items?.length || 0
      return <div>{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
    },
  },
  {
    accessorKey: "total_amount",
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
      const amount = parseFloat(row.getValue("total_amount"))
      return <div className="font-medium">{formatCurrency(amount)}</div>
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
      return <PurchaseOrderStatusBadge status={status} />
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const purchaseOrder = row.original

      // Get the handlers from the table's meta
      const handleView = (table.options.meta as any)?.handleViewPurchaseOrder
      const handleDelete = (table.options.meta as any)?.handleDeletePurchaseOrder
      const handleStatusUpdate = (table.options.meta as any)?.handleStatusUpdatePurchaseOrder

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <PurchaseOrderManageRowActions
            purchaseOrder={purchaseOrder}
            onDetail={handleView ? () => handleView(purchaseOrder.id) : () => {}}
            onDelete={handleDelete ? () => handleDelete(purchaseOrder.id) : () => {}}
            onStatusUpdate={handleStatusUpdate ? () => handleStatusUpdate(purchaseOrder.id) : () => {}}
          />
        </div>
      )
    },
  },
]