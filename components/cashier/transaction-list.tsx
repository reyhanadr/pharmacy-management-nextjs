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
import { Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { columns } from "./transaction-list-column"
import { TransactionRowActions } from "./transaction-row-actions"
import type { Transaction } from "@/components/cashier/cashier-action"
import type { Product } from "@/components/cashier/cashier-action"

interface TransactionHistoryListProps {
  initialTransactions: Transaction[]
  initialProducts: Product[]
}

interface TransactionTableMeta extends TableMeta<Transaction> {
  handleViewTransaction: (transactionId: number) => void
}

export function TransactionHistoryList({ initialTransactions, initialProducts }: TransactionHistoryListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  // const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions)

  // Global filter state for search
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Detail modal state
  const [detailModal, setDetailModal] = React.useState<{
    open: boolean
    transaction: Transaction | null
  }>({
    open: false,
    transaction: null
  })

  // Handle transaction detail view
  const handleViewTransaction = (transactionId: number) => {
    const transaction = initialTransactions.find(t => t.id === transactionId)
    if (transaction) {
      setDetailModal({
        open: true,
        transaction
      })
    }
  }

  const table = useReactTable({
    data: initialTransactions, // Use initialTransactions directly instead of state
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
      handleViewTransaction: handleViewTransaction,
    } as TransactionTableMeta,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      cash: { variant: "default" as const, label: "Tunai", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      card: { variant: "secondary" as const, label: "Kartu", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      digital: { variant: "outline" as const, label: "Digital", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" }
    }
    const config = variants[method as keyof typeof variants] || variants.cash
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, label: "Selesai", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      cancelled: { variant: "destructive" as const, label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[status as keyof typeof variants] || variants.completed
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewTransaction(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data transaksi.
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
              className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleViewTransaction(row.original.id)}
            >
              {/* Mobile Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    #{row.original.id}
                  </span>
                  <div className="flex gap-1">
                    {getPaymentMethodBadge(row.original.payment_method)}
                    {getStatusBadge(row.original.status)}
                  </div>
                </div>
                <TransactionRowActions
                  transaction={row.original}
                  onDetail={() => handleViewTransaction(row.original.id)}
                />
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tanggal:</span>
                  <p className="font-medium">
                    {new Date(row.original.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-bold text-green-600">
                    Rp {row.original.total.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Item:</span>
                  <p>{row.original.items.length} produk</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data transaksi.
          </div>
        )}
      </div>

      {/* Pagination - Desktop */}
      <div className="hidden md:flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} transaksi dipilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
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

      {/* Detail Modal */}
      <TransactionDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        transaction={detailModal.transaction}
        products={initialProducts}
      />
    </div>
  )
}