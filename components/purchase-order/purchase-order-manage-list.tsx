"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table"

import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns, type PurchaseOrderResponse } from "./purchase-order-manage-column"
import { PurchaseOrderManageRowActions } from "./purchase-order-manage-row-action"
import { PurchaseOrderDeleteModal } from "./purchase-order-delete-modal"
import { PurchaseOrderDetailModal } from "./purchase-order-detail-modal"
import { X } from "lucide-react"
import { deletePurchaseOrder } from "./purchase-order-action"
import { toast } from "sonner"
interface PurchaseOrderHistoryListProps {
  initialPurchaseOrders: PurchaseOrderResponse[]
}

interface PurchaseOrderTableMeta extends TableMeta<PurchaseOrderResponse> {
  handleDeletePurchaseOrder: (purchaseOrderId: number) => void
  handleViewPurchaseOrder: (purchaseOrderId: number) => void
  handleStatusUpdate?: () => void
}

export function PurchaseOrderList({ initialPurchaseOrders }: PurchaseOrderHistoryListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrderResponse[]>(initialPurchaseOrders)

  // Global filter state for search
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean
    purchaseOrder: PurchaseOrderResponse | null
  }>({
    open: false,
    purchaseOrder: null
  })

  const handleDeletePurchaseOrder = (purchaseOrderId: number) => {
    const purchaseOrder = purchaseOrders.find(p => p.id === purchaseOrderId)
    if (purchaseOrder) {
      setDeleteModal({
        open: true,
        purchaseOrder
      })
    }
  }

  const handleDeleteModalClose = () => {
    setDeleteModal({
      open: false,
      purchaseOrder: null
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.purchaseOrder) return

    try {
      await deletePurchaseOrder(deleteModal.purchaseOrder.id)

      // Remove the deleted purchase order from the local state
      setPurchaseOrders(prev =>
        prev.filter(po => po.id !== deleteModal.purchaseOrder!.id)
      )

      handleDeleteModalClose()
      toast.success(`Purchase order ${deleteModal.purchaseOrder!.id} berhasil dihapus`)
    } catch (error) {
      handleDeleteModalClose()
      console.error('Error deleting purchase order:', error)
      toast.error(`Tidak boleh menghapus purchase order yang sudah diterima`)
    }
  }

  // Handle clear all selections
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // Detail modal state
  const [detailModal, setDetailModal] = React.useState<{
    open: boolean
    purchaseOrder: PurchaseOrderResponse | null
  }>({
    open: false,
    purchaseOrder: null
  })

  // Handle purchase order detail view
  const handleViewPurchaseOrder = (purchaseOrderId: number) => {
    const purchaseOrder = purchaseOrders.find(p => p.id === purchaseOrderId)
    if (purchaseOrder) {
      setDetailModal({
        open: true,
        purchaseOrder
      })
    }
  }

  // Handle purchase order status update (receive/cancel)
  const handleStatusUpdate = () => {
    // Refresh the page to get updated purchase orders
    window.location.reload()
  }

  const table = useReactTable({
    data: purchaseOrders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getRowId: (row) => row.id.toString(),
    meta: {
      handleDeletePurchaseOrder: handleDeletePurchaseOrder,
      handleViewPurchaseOrder: handleViewPurchaseOrder,
      handleStatusUpdate: handleStatusUpdate,
    } as PurchaseOrderTableMeta,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari purchase order..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="whitespace-nowrap"
            >
              <X className="mr-1 h-4 w-4" />
              Batal Pilih ({Object.keys(rowSelection).length})
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50"
                  onClick={() => handleViewPurchaseOrder(row.original.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Klik untuk melihat detail purchase order ${row.getValue("id")}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleViewPurchaseOrder(row.original.id)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`whitespace-nowrap ${cell.column.id === 'select' || cell.column.id === 'actions' ? '' : 'cursor-pointer'}`}
                      onClick={cell.column.id === 'select' || cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data purchase order.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className={`border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors focus-within:bg-muted/50 ${
                row.getIsSelected() ? 'bg-muted' : ''
              }`}
              onClick={() => handleViewPurchaseOrder(row.original.id)}
              role="button"
              tabIndex={0}
              aria-label={`Klik untuk melihat detail purchase order ${row.getValue("id")}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewPurchaseOrder(row.original.id)
                }
              }}
            >
              {/* Mobile Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Pilih ${row.getValue("id")}`}
                  />
                  <span className="font-medium text-sm">
                    PO-{String(row.getValue("id")).padStart(4, '0')}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <PurchaseOrderManageRowActions
                    purchaseOrder={row.original}
                    onDetail={() => handleViewPurchaseOrder(row.original.id)}
                    onDelete={() => handleDeletePurchaseOrder(row.original.id)}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <p className="font-medium">{(row.getValue("suppliers") as { name: string } | null)?.name || "Tidak ada supplier"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    <PurchaseOrderStatusBadge status={row.getValue("status")} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Item:</span>
                  <p>{(row.original.purchase_order_items?.length || 0)} item{(row.original.purchase_order_items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tanggal:</span>
                  <p>{new Date(row.getValue("created_at")).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-medium">
                    Rp {new Intl.NumberFormat("id-ID").format(row.getValue("total_amount") as number)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data purchase order.
          </div>
        )}
      </div>

      {/* Pagination - Desktop */}
      <div className="hidden md:flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="space-x-2">
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      {/* Pagination - Mobile */}
      <div className="md:hidden flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} dipilih
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ›
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      <PurchaseOrderDeleteModal
        open={deleteModal.open}
        onOpenChange={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Hapus Purchase Order"
        description={deleteModal.purchaseOrder ?
          `Apakah Anda yakin ingin menghapus purchase order PO-${String(deleteModal.purchaseOrder.id).padStart(4, '0')} dari supplier ${deleteModal.purchaseOrder.suppliers?.name || 'Tidak ada supplier'}? Tindakan ini tidak dapat dibatalkan.` :
          'Apakah Anda yakin ingin menghapus purchase order ini? Tindakan ini tidak dapat dibatalkan.'
        }
      />

      {/* Detail Modal */}
      <PurchaseOrderDetailModal
        open={detailModal.open}
        onOpenChange={(open: boolean) => setDetailModal({ ...detailModal, open })}
        purchaseOrder={detailModal.purchaseOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}