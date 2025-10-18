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
import { Search, Trash, X } from "lucide-react"
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
import { deleteSupplier, deleteMultipleSuppliers, Supplier } from "./supplier-action"
import { toast } from "sonner"
import { columns } from "./supplier-list-column"
import { SupplierRowActions } from "./supplier-row-actions"
import { SupplierDeleteModal } from "./supplier-delete-modal"
import { SupplierDetailModal } from "./supplier-detail-modal"
import { EditSupplierModal } from "./supplier-edit-modal"

interface SupplierListClientProps {
  initialSuppliers: Supplier[]
  onAddSupplier?: () => void
}

interface SupplierTableMeta extends TableMeta<Supplier> {
  handleDeleteSupplier: (supplierId: number) => void
  handleViewSupplier: (supplierId: number) => void
  handleEditSupplier: (supplierId: number) => void
}

export function SupplierList({ initialSuppliers, onAddSupplier }: SupplierListClientProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(initialSuppliers)

  // Global filter state for search
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean
    type: 'single' | 'multiple'
    supplierId?: number
    supplierName?: string
  }>({
    open: false,
    type: 'single'
  })

  // Detail modal state
  const [detailModal, setDetailModal] = React.useState<{
    open: boolean
    supplier: Supplier | null
  }>({
    open: false,
    supplier: null
  })

  // Edit modal state
  const [editModal, setEditModal] = React.useState<{
    open: boolean
    supplier: Supplier | null
  }>({
    open: false,
    supplier: null
  })

  const handleDeleteSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    setDeleteModal({
      open: true,
      type: 'single',
      supplierId,
      supplierName: supplier?.name
    })
  }

  // Handle supplier detail view
  const handleViewSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (supplier) {
      setDetailModal({
        open: true,
        supplier
      })
    }
  }

  const handleSupplierUpdated = () => {
    // Refresh the page to get updated suppliers
    window.location.reload()
  }

  // Handle supplier edit
  const handleEditSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (supplier) {
      setEditModal({
        open: true,
        supplier
      })
    }
  }

  // Handle clear all selections
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // Handle multiple supplier deletion
  const handleDeleteMultipleSuppliers = () => {
    const selectedIds = Object.keys(rowSelection).map(id => parseInt(id))
    if (selectedIds.length === 0) return

    setDeleteModal({
      open: true,
      type: 'multiple',
      supplierId: selectedIds.length
    })
  }

  const confirmDeleteSupplier = async () => {
    if (!deleteModal.supplierId) return

    try {
      const result = await deleteSupplier(deleteModal.supplierId)
      if (result.success) {
        setSuppliers(suppliers.filter(s => s.id !== deleteModal.supplierId))
        toast.success('Supplier berhasil dihapus')
      } else {
        toast.error(result.error || 'Gagal menghapus supplier')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Terjadi kesalahan saat menghapus supplier')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  const confirmDeleteMultipleSuppliers = async () => {
    console.log('Current rowSelection:', rowSelection)
    const selectedIds = Object.keys(rowSelection).map(id => parseInt(id))
    console.log('Parsed selectedIds:', selectedIds)

    try {
      const result = await deleteMultipleSuppliers(selectedIds)
      if (result.success) {
        setSuppliers(suppliers.filter(s => !selectedIds.includes(s.id)))
        setRowSelection({})
        toast.success(`${selectedIds.length} supplier berhasil dihapus`)
      } else {
        toast.error(result.error || 'Gagal menghapus supplier terpilih')
      }
    } catch (error) {
      console.error('Error deleting multiple suppliers:', error)
      toast.error('Terjadi kesalahan saat menghapus supplier terpilih')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  const table = useReactTable({
    data: suppliers,
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
    getRowId: (row) => row.id.toString(), // Gunakan supplier.id sebagai row ID
    meta: {
      handleDeleteSupplier: handleDeleteSupplier,
      handleViewSupplier: handleViewSupplier,
      handleEditSupplier: handleEditSupplier,
    } as SupplierTableMeta,
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
              placeholder="Cari supplier..."
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
              onClick={handleDeleteMultipleSuppliers}
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
                  onClick={() => handleViewSupplier(row.original.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Klik untuk melihat detail supplier ${row.getValue("name")}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleViewSupplier(row.original.id)
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
                  Tidak ada data supplier.
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
              onClick={() => handleViewSupplier(row.original.id)}
              role="button"
              tabIndex={0}
              aria-label={`Klik untuk melihat detail supplier ${row.getValue("name")}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewSupplier(row.original.id)
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
                  <SupplierRowActions
                    supplier={row.original}
                    onDetail={() => handleViewSupplier(row.original.id)}
                    onEdit={() => handleEditSupplier(row.original.id)}
                    onDelete={() => handleDeleteSupplier(row.original.id)}
                  />
                </div>
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-1 gap-2 text-sm">
                {row.original.contact_person && (
                  <div>
                    <span className="text-muted-foreground">Contact Person:</span>
                    <p className="font-medium">{row.original.contact_person}</p>
                  </div>
                )}
                {row.original.phone && (
                  <div>
                    <span className="text-muted-foreground">Telepon:</span>
                    <p className="font-medium">{row.original.phone}</p>
                  </div>
                )}
                {row.original.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{row.original.email}</p>
                  </div>
                )}
                {row.original.address && (
                  <div>
                    <span className="text-muted-foreground">Alamat:</span>
                    <p className="font-medium">{row.original.address}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Tanggal Ditambah:</span>
                  <p>{new Date(row.getValue("created_at")).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data supplier.
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
      <SupplierDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={
          deleteModal.type === 'single'
            ? confirmDeleteSupplier
            : confirmDeleteMultipleSuppliers
        }
        title={
          deleteModal.type === 'single'
            ? `Hapus Supplier`
            : `Hapus Supplier Terpilih`
        }
        description={
          deleteModal.type === 'single'
            ? `Apakah Anda yakin ingin menghapus supplier "${deleteModal.supplierName}"? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus ${deleteModal.supplierId || 0} supplier terpilih? Tindakan ini tidak dapat dibatalkan.`
        }
      />

      {/* Detail Modal */}
      <SupplierDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        supplier={detailModal.supplier}
        onEdit={() => detailModal.supplier && handleEditSupplier(detailModal.supplier.id)}
      />
        {/* Edit Modal */}
      <EditSupplierModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ ...editModal, open })}
        supplier={editModal.supplier}
        onSupplierUpdated={handleSupplierUpdated}
      />
    </div>
  )
}