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
import { Search, Filter, Download, CreditCard, DollarSign, Smartphone, CheckCircle2, XCircle } from "lucide-react"
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
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDateLong } from "@/components/utils/format-date"

interface TransactionHistoryListProps {
  initialTransactions: Transaction[]
}

interface TransactionTableMeta extends TableMeta<Transaction> {
  handleViewTransaction: (transactionId: number) => void
}

export function TransactionHistoryList({ initialTransactions }: TransactionHistoryListProps) {
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
      cash: {
        variant: "default" as const,
        label: "Tunai",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: DollarSign
      },
      card: {
        variant: "secondary" as const,
        label: "Kartu",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: CreditCard
      },
      digital: {
        variant: "outline" as const,
        label: "Digital",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        icon: Smartphone
      }
    }
    const config = variants[method as keyof typeof variants] || variants.cash
    const IconComponent = config.icon
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 text-xs`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: {
        variant: "default" as const,
        label: "Selesai",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: CheckCircle2
      },
      cancelled: {
        variant: "destructive" as const,
        label: "Dibatalkan",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: XCircle
      }
    }
    const config = variants[status as keyof typeof variants] || variants.completed
    const IconComponent = config.icon
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 text-xs`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-[350px]">
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
                    # TRX-{String(row.original.id).padStart(4, '0')}
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
                    {formatDateLong(row.original.date)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-bold text-green-600">
                    {formatCurrency(row.original.total)}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).slice(
              Math.max(0, table.getState().pagination.pageIndex - 2),
              Math.max(0, table.getState().pagination.pageIndex - 2) + 5
            ).map((page) => (
              <Button
                key={page}
                variant={table.getState().pagination.pageIndex === page - 1 ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(page - 1)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>

      {/* Pagination - Mobile */}
      <div className="md:hidden flex items-center justify-end py-4">
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
      />
    </div>
  )
}