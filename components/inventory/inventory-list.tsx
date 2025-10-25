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
import { Search, Download } from "lucide-react"
import { InventoryFilter } from "./inventory-filter"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteProduct, deleteMultipleProducts, Product } from "./inventory-action"
import { toast } from "sonner"
import { columns } from "./inventory-list-column"
import { MobileCardView, MobilePagination } from "./inventory-list-card"
import { InventoryDeleteModal } from "./inventory-delete-modal"
import { InventoryDetailModal } from "./inventory-detail-modal"
import { EditProductModal } from "./inventory-edit-modal"
import { ExportExcelButton } from "./export-excel-button"

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
    console.log('Current rowSelection:', rowSelection)
    const selectedIds = Object.keys(rowSelection).map(id => parseInt(id))
    console.log('Parsed selectedIds:', selectedIds)

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
    getRowId: (row) => row.id.toString(), // Gunakan produk.id sebagai row ID
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
      <div className="space-y-4">
        {/* Search and Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <InventoryFilter table={table} />
              <ExportExcelButton data={products} fileName="data-produk" />
            </div>
          </div>
        </div>

        {/* Selection Controls Row */}
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
      <MobileCardView
        table={table}
        handleViewProduct={handleViewProduct}
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={handleDeleteProduct}
      />

      {/* Pagination - Desktop */}
      <div className="hidden md:flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hidden sm:flex"
          >
            &laquo;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            &lsaquo;
          </Button>
          
          {/* Page Numbers */}
          {(() => {
            const pageCount = table.getPageCount();
            const currentPage = table.getState().pagination.pageIndex;
            const pages = [];
            
            // Always show first page
            if (currentPage > 1) {
              pages.push(1);
            }
            
            // Show ellipsis if needed
            if (currentPage > 3) {
              pages.push('...');
            }
            
            // Show current page and adjacent pages
            for (let i = Math.max(1, currentPage - 1); i <= Math.min(pageCount, currentPage + 1); i++) {
              if (i > 0 && i <= pageCount) {
                pages.push(i);
              }
            }
            
            // Show ellipsis if needed
            if (currentPage < pageCount - 2) {
              pages.push('...');
            }
            
            // Always show last page if different from current range
            if (currentPage < pageCount - 1 && !pages.includes(pageCount)) {
              pages.push(pageCount);
            }
            
            return pages.map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === 'number' && table.setPageIndex(page - 1)}
                disabled={page === '...'}
                className={page === '...' ? 'cursor-default' : ''}
              >
                {page}
              </Button>
            ));
          })()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            &rsaquo;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="hidden sm:flex"
          >
            &raquo;
          </Button>
        </div>
      </div>

      {/* Pagination - Mobile */}
      <MobilePagination table={table} />

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