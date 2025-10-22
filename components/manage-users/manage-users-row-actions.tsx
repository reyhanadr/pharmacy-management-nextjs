import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Edit, Eye, MoreHorizontal, Trash2, User as UserIcon, Shield, ShieldOff } from "lucide-react"
import type { User } from './manage-users-action'

/**
 * User Role Badge Component
 */
function UserRoleBadge({ role }: { role: 'owner' | 'pegawai' }) {
  const roleConfig = {
    owner: {
      label: 'Owner',
      className: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Shield className="w-3 h-3" />
    },
    pegawai: {
      label: 'Pegawai',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <UserIcon className="w-3 h-3" />
    }
  }

  const config = roleConfig[role]

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  )
}

interface ManageUsersRowActionsProps {
  user: User
  onDetail: () => void
  onEdit: () => void
  onDelete: () => void
  onBan?: () => void
  isCurrentUser?: boolean
}

export function ManageUsersRowActions({
  user,
  onDetail,
  onEdit,
  onDelete,
  onBan,
  isCurrentUser = false,
}: ManageUsersRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserRoleBadge role={user.role} />
          {user.full_name || user.username || user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.email)}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Salin Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDetail} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onEdit}
          className="cursor-pointer"
          disabled={isCurrentUser}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isCurrentUser ? 'Tidak dapat edit diri sendiri' : 'Edit Pengguna'}
        </DropdownMenuItem>
        {onBan && (
          <DropdownMenuItem
            onClick={onBan}
            className="cursor-pointer text-orange-600 focus:text-orange-600"
            disabled={isCurrentUser}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            {isCurrentUser ? 'Tidak dapat ban diri sendiri' : 'Ban Pengguna'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isCurrentUser}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isCurrentUser ? 'Tidak dapat hapus diri sendiri' : 'Hapus Pengguna'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}