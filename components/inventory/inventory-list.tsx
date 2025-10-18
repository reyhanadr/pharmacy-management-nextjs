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
import { deleteProduct, deleteMultipleProducts, Product } from "./inventory-list-action"
import { toast } from "sonner"
import { columns } from "./inventory-list-column"
import { InventoryRowActions } from "./inventory-row-actions"
import { InventoryDeleteModal } from "./inventory-delete-modal"
import { InventoryDetailModal } from "./inventory-detail-modal"
import { EditProductModal } from "./inventory-edit-modal"
import { Trash, X } from "lucide-react"

interface InventoryListClientProps {
  initialProducts: Product[]
}

interface InventoryTableMeta extends TableMeta<Product> {
  handleDeleteProduct: (productId: number) => void
  handleViewProduct: (productId: number) => void
  handleEditProduct: (productId: number) => void
}

export function InventoryList({ initialProducts }: InventoryListClientProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [products, setProducts] = React.useState<Product[]>(initialProducts)

  // Global filter state for search
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean
    type: 'single' | 'multiple'
    productId?: number
    productName?: string
  }>({
    open: false,
    type: 'single'
  })

  // Edit modal state
  const [editModal, setEditModal] = React.useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null
  })

  const handleDeleteProduct = (productId: number) => {
    const product = products.find(p => p.id === productId)
    setDeleteModal({
      open: true,
      type: 'single',
      productId,
      productName: product?.name
    })
  }

  // Detail modal state
  const [detailModal, setDetailModal] = React.useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null
  })

    // Handle product edit
  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setEditModal({
        open: true,
        product
      })
    }
  }

  // Handle clear all selections
  const handleClearSelection = () => {
    setRowSelection({})
    toast.success('Pilihan produk dibatalkan')
  }

  // Handle product detail view
  const handleViewProduct = (productId: number) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setDetailModal({
        open: true,
        product
      })
    }
  }
  // Handle product update after edit
  const handleProductUpdated = () => {
    // Refresh the page to get updated products
    window.location.reload()
  }

  const confirmDeleteProduct = async () => {
    if (!deleteModal.productId) return

    try {
      const result = await deleteProduct(deleteModal.productId)
      if (result.success) {
        setProducts(products.filter(p => p.id !== deleteModal.productId))
        toast.success('Produk berhasil dihapus')
      } else {
        toast.error(result.error || 'Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Terjadi kesalahan saat menghapus produk')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  // Handle multiple product deletion
  const handleDeleteMultipleProducts = () => {
    const selectedIds = Object.keys(rowSelection).map(id => parseInt(id))
    if (selectedIds.length === 0) return

    setDeleteModal({
      open: true,
      type: 'multiple',
      productId: selectedIds.length
    })
  }

  const confirmDeleteMultipleProducts = async () => {
    const selectedIds = Object.keys(rowSelection).map(id => parseInt(id))

    try {
      const result = await deleteMultipleProducts(selectedIds)
      if (result.success) {
        setProducts(products.filter(p => !selectedIds.includes(p.id)))
        setRowSelection({})
        toast.success(`${selectedIds.length} produk berhasil dihapus`)
      } else {
        toast.error(result.error || 'Gagal menghapus produk terpilih')
      }
    } catch (error) {
      console.error('Error deleting multiple products:', error)
      toast.error('Terjadi kesalahan saat menghapus produk terpilih')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  const table = useReactTable({
    data: products,
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
    meta: {
      handleDeleteProduct: handleDeleteProduct,
      handleViewProduct: handleViewProduct,
      handleEditProduct: handleEditProduct,
    } as InventoryTableMeta,
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
              placeholder="Cari produk..."
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMultipleProducts}
              className="whitespace-nowrap"
            >
              <Trash className="mr-1 h-4 w-4" />
              Hapus Terpilih ({Object.keys(rowSelection).length})
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
                  onClick={() => handleViewProduct(row.original.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Klik untuk melihat detail produk ${row.getValue("name")}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleViewProduct(row.original.id)
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
                  Tidak ada data produk.
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
              onClick={() => handleViewProduct(row.original.id)}
              role="button"
              tabIndex={0}
              aria-label={`Klik untuk melihat detail produk ${row.getValue("name")}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewProduct(row.original.id)
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
                    aria-label={`Pilih ${row.getValue("name")}`}
                  />
                  <span className="font-medium text-sm">
                    {row.getValue("name")}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <InventoryRowActions
                    product={row.original}
                    onDetail={() => handleViewProduct(row.original.id)}
                    onEdit={() => handleEditProduct(row.original.id)}
                    onDelete={() => handleDeleteProduct(row.original.id)}
                  />
                </div>
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kode:</span>
                  <p className="font-medium">{row.getValue("code")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kategori:</span>
                  <p>{row.getValue("category") || "Tidak ada kategori"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stok:</span>
                  <p className={(row.getValue("stock") as number) < 10 ? "text-red-600 font-medium" : ""}>
                    {row.getValue("stock")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <p>{row.getValue("supplier_name") || "Tidak ada supplier"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Harga Beli:</span>
                  <p>
                    Rp {new Intl.NumberFormat("id-ID").format(row.getValue("price_buy") as number)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Harga Jual:</span>
                  <p>
                    Rp {new Intl.NumberFormat("id-ID").format(row.getValue("price_sell") as number)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data produk.
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

      {/* Delete Confirmation Modal */}
      <InventoryDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={
          deleteModal.type === 'single'
            ? confirmDeleteProduct
            : confirmDeleteMultipleProducts
        }
        title={
          deleteModal.type === 'single'
            ? `Hapus Produk`
            : `Hapus Produk Terpilih`
        }
        description={
          deleteModal.type === 'single'
            ? `Apakah Anda yakin ingin menghapus produk "${deleteModal.productName}"? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus ${deleteModal.productId || 0} produk terpilih? Tindakan ini tidak dapat dibatalkan.`
        }
      />

      {/* Detail Modal */}
      <InventoryDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        product={detailModal.product}
        onEdit={() => detailModal.product && handleEditProduct(detailModal.product.id)}
      />
      {/* Edit Modal */}
      <EditProductModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ ...editModal, open })}
        product={editModal.product}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  )
}