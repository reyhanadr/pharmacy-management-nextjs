/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, User as UserIcon, Shield, Mail, ShieldOff, ShieldCheck } from "lucide-react"
import { ManageUsersRowActions } from "./manage-users-row-actions"
import type { User } from "./manage-users-action"
import { UserBanStatusBadge } from "./user-ban-status-badge"
import { UserRoleBadge } from "./user-role-badge"

export const columns: ColumnDef<User>[] = [
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
    cell: ({ row, table }) => {
      const currentUserId = (table.options.meta as any)?.currentUserId
      const isCurrentUser = row.original.id === currentUserId

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Pilih ${row.getValue("full_name") || row.getValue("username")}`}
          disabled={isCurrentUser}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Lengkap
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("full_name") || (
          <span className="text-muted-foreground italic">Belum diisi</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("username") || (
          <span className="text-muted-foreground italic">Belum diisi</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Mail className="mr-1 h-4 w-4" />
          Email
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Shield className="mr-1 h-4 w-4" />
          Role
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <UserRoleBadge role={row.getValue("role")} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
          Tanggal Dibuat
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <div className="whitespace-nowrap text-sm">{date.toLocaleDateString("id-ID")}</div>
    },
  },
  {
    id: "ban_status",
    header: "Status Ban",
    cell: () => {
      // Real ban status will be handled by list component override using getUserBanStatus API
      return <UserBanStatusBadge isBanned={false} />
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original
      const currentUserId = (table.options.meta as any)?.currentUserId
      const isCurrentUser = user.id === currentUserId

      // Get the handlers from the table's meta
      const handleDelete = (table.options.meta as any)?.handleDeleteUser
      const handleView = (table.options.meta as any)?.handleViewUser
      const handleEdit = (table.options.meta as any)?.handleEditUser
      const handleBan = (table.options.meta as any)?.handleBanUser

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <ManageUsersRowActions
            user={user}
            onDetail={handleView ? () => handleView(user.id) : () => {}}
            onEdit={handleEdit ? () => handleEdit(user.id) : () => {}}
            onDelete={handleDelete ? () => handleDelete(user.id) : () => {}}
            onBan={handleBan ? () => handleBan(user.id) : undefined}
            isCurrentUser={isCurrentUser}
          />
        </div>
      )
    },
  },
]