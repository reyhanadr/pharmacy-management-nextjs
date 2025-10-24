/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Clock, User, Eye } from "lucide-react"
import type { AuditLog } from "./audit-log-action"


export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Waktu
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 mb-1 text-gray-400" />
            <div className="text-sm">
              {date.toLocaleDateString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "action_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Aksi
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const action = row.getValue("action_type") as string
      const variants = {
        insert: { variant: "default" as const, label: "Tambah", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
        update: { variant: "secondary" as const, label: "Ubah", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
        delete: { variant: "destructive" as const, label: "Hapus", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
      }
      const config = variants[action as keyof typeof variants] || variants.update
      return (
        <div className="text-center">
          <Badge variant={config.variant} className={config.color}>
            {config.label}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "table_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tabel
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm">
        {row.getValue("table_name")}
      </div>
    ),
  },
  {
    accessorKey: "record_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Record ID
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm">
        {row.getValue("record_id") || '-'}
      </div>
    ),
  },
  {
    id: "user_profile",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const userProfile = row.original.user_profile
      return (
        <div className="text-center">
          <div className="flex flex-col items-center">
            <User className="h-4 w-4 mb-1 text-gray-400" />
            <div className="text-sm font-medium">
              {userProfile?.full_name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">
              {userProfile?.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Detail",
    cell: ({ row, table }) => {
      const handleViewDetail = (table.options.meta as any)?.handleViewDetail
      return (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetail && handleViewDetail(row.original)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Lihat Detail
          </Button>
        </div>
      )
    },
  },
]