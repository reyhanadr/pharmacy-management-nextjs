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
import { deleteUser, deleteMultipleUsers, User, banUser, unbanUser, getUserBanStatus } from "./manage-users-action"
import { toast } from "sonner"
import { columns } from "./manage-users-list-column"
import { ManageUsersRowActions } from "./manage-users-row-actions"
import { ManageUsersDetailModal } from "./manage-users-detail-modal"
import { ManageUsersDeleteModal } from "./manage-users-delete-modal"
import { ManageUsersEditModal } from "./manage-users-edit-modal"
import { ManageUsersBanModal } from "./manage-users-ban-modal"
import { Trash, X} from "lucide-react"
import { UserBanStatusBadge } from "./user-ban-status-badge"

interface ManageUsersListProps {
  initialUsers: User[]
  currentUserId: string
}

interface ManageUsersTableMeta extends TableMeta<User> {
  handleDeleteUser: (userId: string) => void
  handleViewUser: (userId: string) => void
  handleEditUser: (userId: string) => void
  handleBanUser: (userId: string) => void
  currentUserId: string
}


export function ManageUsersList({ initialUsers, currentUserId }: ManageUsersListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [users, setUsers] = React.useState<User[]>(initialUsers)

  // Global filter state for search
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean
    type: 'single' | 'multiple'
    userId?: string
    userName?: string
    targetUserId?: string
  }>({
    open: false,
    type: 'single'
  })

  // Edit modal state
  const [editModal, setEditModal] = React.useState<{
    open: boolean
    user: User | null
  }>({
    open: false,
    user: null
  })

  // Add modal state
  // const [addModal, setAddModal] = React.useState<boolean>(false)

  // Ban modal state
  const [banModal, setBanModal] = React.useState<{
    open: boolean
    userId?: string
    userName?: string
    isBanning: boolean
    targetUserId?: string
  }>({
    open: false,
    isBanning: true
  })
  const [banStatus, setBanStatus] = React.useState<{
    isBanned: boolean
    banDuration?: string
    error?: string
  }>({
    isBanned: false,
    banDuration: undefined,
    error: undefined
  })

  // Ban status state - maps userId to ban status
  const [banStatusMap, setBanStatusMap] = React.useState<Record<string, {isBanned: boolean, banDuration?: string}>>({})

  // Load ban status for all users
  React.useEffect(() => {
    const loadBanStatuses = async () => {
      if (users.length === 0) return

      const statusPromises = users.map(async (user) => {
        try {
          const status = await getUserBanStatus(user.id)
          return { userId: user.id, status }
        } catch (error) {
          console.error(`Error loading ban status for user ${user.id}:`, error)
          return { userId: user.id, status: { isBanned: false, banDuration: undefined } }
        }
      })

      const results = await Promise.all(statusPromises)
      const statusMap: Record<string, {isBanned: boolean, banDuration?: string}> = {}

      results.forEach(({ userId, status }) => {
        statusMap[userId] = status
      })

      setBanStatusMap(statusMap)
    }

    loadBanStatuses()
  }, [users])

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUserId) return // Prevent self-deletion
    const user = users.find(u => u.id === userId)
    setDeleteModal({
      open: true,
      type: 'single',
      userId,
      userName: user?.full_name || user?.username || user?.email,
      targetUserId: userId
    })
  }

  // Detail modal state
  const [detailModal, setDetailModal] = React.useState<{
    open: boolean
    user: User | null
  }>({
    open: false,
    user: null
  })

  // Handle user edit
  const handleEditUser = (userId: string) => {
    if (userId === currentUserId) return // Prevent self-editing
    const user = users.find(u => u.id === userId)
    if (user) {
      setEditModal({
        open: true,
        user
      })
    }
  }

  // Handle clear all selections
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // Handle user detail view
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setDetailModal({
        open: true,
        user
      })
    }
  }
  // Handle user update after edit
  const handleUserUpdated = () => {
    // Refresh the page to get updated users
    window.location.reload()
  }

  // Handle user added
  // const handleUserAdded = (newUser: User) => {
  //   setUsers(prev => [newUser, ...prev])
  //   toast.success('Pengguna baru berhasil ditambahkan')
  // }

  // Handle user ban - check current status and determine if ban or unban
  const handleBanUser = async (userId: string) => {
    if (userId === currentUserId) return // Prevent self-banning
    try {
      const banStatus = await getUserBanStatus(userId)
      const user = users.find(u => u.id === userId)

      setBanModal({
        open: true,
        userId,
        userName: user?.full_name || user?.username || user?.email,
        isBanning: !banStatus.isBanned, // If user is banned, this will be false (unban), if not banned, this will be true (ban)
        targetUserId: userId
      })
    } catch (error) {
      console.error(`Error checking ban status for user ${userId}:`, error)
      toast.error('Gagal memeriksa status ban pengguna')
    }
  }

  

  // Update ban status after ban/unban operations
  const updateBanStatus = async (userId: string) => {
    try {
      const status = await getUserBanStatus(userId)
      setBanStatusMap(prev => ({
        ...prev,
        [userId]: status
      }))
    } catch (error) {
      console.error(`Error updating ban status for user ${userId}:`, error)
    }
  }

  const confirmBanUser = async () => {
    if (!banModal.userId) return

    try {
      const result = banModal.isBanning
        ? await banUser(banModal.userId)
        : await unbanUser(banModal.userId)

      if (result.success) {
        toast.success(banModal.isBanning ? 'Pengguna berhasil dinonaktifkan' : 'Pengguna berhasil diaktifkan')
        // Update ban status in local state instead of refreshing page
        await updateBanStatus(banModal.userId)
        window.location.reload()
      } else {
        toast.error(result.error || 'Gagal melakukan aksi ban')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Terjadi kesalahan saat melakukan aksi ban')
    } finally {
      setBanModal({ open: false, isBanning: true })
    }
  }

  const confirmDeleteUser = async () => {
    if (!deleteModal.userId) return

    try {
      const result = await deleteUser(deleteModal.userId)
      if (result.success) {
        setUsers(users.filter(u => u.id !== deleteModal.userId))
        toast.success('Pengguna berhasil dihapus')
      } else {
        toast.error(result.error || 'Gagal menghapus pengguna')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Terjadi kesalahan saat menghapus pengguna')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  // Handle multiple user deletion
  const handleDeleteMultipleUsers = () => {
    const selectedIds = Object.keys(rowSelection).map(id => id)
    if (selectedIds.length === 0) return

    setDeleteModal({
      open: true,
      type: 'multiple',
      userId: selectedIds.length.toString(),
      targetUserId: selectedIds.join(',') // Pass all selected IDs
    })
  }

  const confirmDeleteMultipleUsers = async () => {
    console.log('Current rowSelection:', rowSelection)
    const selectedIds = Object.keys(rowSelection)

    // Filter out current user from selection
    const filteredIds = selectedIds.filter(id => id !== currentUserId)

    if (filteredIds.length === 0) {
      toast.error('Tidak ada pengguna yang dapat dihapus')
      setDeleteModal({ open: false, type: 'single' })
      return
    }

    // Update modal state with filtered count
    setDeleteModal(prev => ({
      ...prev,
      userId: filteredIds.length.toString(),
      targetUserId: filteredIds.join(',')
    }))

    try {
      const result = await deleteMultipleUsers(filteredIds)
      if (result.success) {
        setUsers(users.filter(u => !filteredIds.includes(u.id)))
        setRowSelection({})
        toast.success(`${filteredIds.length} pengguna berhasil dihapus`)
      } else {
        toast.error(result.error || 'Gagal menghapus pengguna terpilih')
      }
    } catch (error) {
      console.error('Error deleting multiple users:', error)
      toast.error('Terjadi kesalahan saat menghapus pengguna terpilih')
    } finally {
      setDeleteModal({ open: false, type: 'single' })
    }
  }

  const table = useReactTable({
    data: users,
    columns: columns.map((col) => {
      // Override ban_status column to use real ban status
      if (col.id === 'ban_status') {
        return {
          ...col,
          cell: ({ row }: { row: { original: User } }) => {
            const banStatus = banStatusMap[row.original.id]
            return <UserBanStatusBadge isBanned={banStatus?.isBanned || false} />
          }
        }
      }
      return col
    }),
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
    getRowId: (row) => row.id, // Gunakan user.id sebagai row ID
    meta: {
      handleDeleteUser: handleDeleteUser,
      handleViewUser: handleViewUser,
      handleEditUser: handleEditUser,
      handleBanUser: handleBanUser,
      currentUserId: currentUserId,
    } as ManageUsersTableMeta,
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
              placeholder="Cari pengguna..."
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
              className="whitespace-nowrap cursor-pointer"
            >
              <X className="h-4 w-4" />
              Batal Pilih ({Object.keys(rowSelection).length})
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMultipleUsers}
              className="whitespace-nowrap cursor-pointer"
            >
              <Trash className="h-4 w-4" />
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  onClick={() => handleViewUser(row.original.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Klik untuk melihat detail pengguna ${row.getValue("full_name") || row.getValue("username")}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleViewUser(row.original.id)
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
                  <div className="text-sm text-muted-foreground">
                    Tidak ada data pengguna.
                  </div>
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
              onClick={() => handleViewUser(row.original.id)}
              role="button"
              tabIndex={0}
              aria-label={`Klik untuk melihat detail pengguna ${row.getValue("full_name") || row.getValue("username")}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewUser(row.original.id)
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
                    aria-label={`Pilih ${row.getValue("full_name") || row.getValue("username")}`}
                    disabled={row.original.id === currentUserId}
                  />
                  <span className="font-medium text-sm">
                    {row.getValue("full_name") || row.getValue("username") || row.getValue("email")}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ManageUsersRowActions
                    user={row.original}
                    onDetail={() => handleViewUser(row.original.id)}
                    onEdit={() => handleEditUser(row.original.id)}
                    onDelete={() => handleDeleteUser(row.original.id)}
                    onBan={() => handleBanUser(row.original.id)}
                    isCurrentUser={row.original.id === currentUserId}
                  />
                </div>
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Username:</span>
                  <p className="font-medium">{row.getValue("username") || "Belum diisi"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <p>{row.getValue("role") === 'owner' ? 'Owner' : 'Pegawai'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium" title={row.getValue("email") as string}>
                    {(row.getValue("email") as string).length > 15
                      ? `${(row.getValue("email") as string).substring(0, 15)}...`
                      : (row.getValue("email") as string)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>{new Date(row.getValue("created_at")) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'Aktif' : 'Tidak Aktif'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tanggal Dibuat:</span>
                  <p>{new Date(row.getValue("created_at")).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data pengguna.
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
      <ManageUsersDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={
          deleteModal.type === 'single'
            ? confirmDeleteUser
            : confirmDeleteMultipleUsers
        }
        title={
          deleteModal.type === 'single'
            ? `Hapus Pengguna`
            : `Hapus Pengguna Terpilih`
        }
        description={
          deleteModal.type === 'single'
            ? `Apakah Anda yakin ingin menghapus pengguna "${deleteModal.userName}"? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus ${deleteModal.userId || 0} pengguna terpilih? Tindakan ini tidak dapat dibatalkan.`
        }
        currentUserId={currentUserId}
        targetUserId={deleteModal.targetUserId}
      />

      {/* Detail Modal */}
      <ManageUsersDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        user={detailModal.user}
        onEdit={() => detailModal.user && handleEditUser(detailModal.user.id)}
        onBan={() => detailModal.user && handleBanUser(detailModal.user.id)}
        currentUserId={currentUserId}
      />
      {/* Edit Modal */}
      <ManageUsersEditModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ ...editModal, open })}
        user={editModal.user}
        onUserUpdated={handleUserUpdated}
      />

      {/* Ban Modal */}
      <ManageUsersBanModal
        open={banModal.open}
        onOpenChange={(open) => setBanModal({ ...banModal, open })}
        onConfirm={confirmBanUser}
        title={banModal.isBanning ? `Nonaktifkan Pengguna` : `Aktifkan Pengguna`}
        description={banModal.isBanning
          ? `Apakah Anda yakin ingin menonaktifkan pengguna "${banModal.userName}"? Pengguna tidak akan dapat login selama durasi nonaktif.`
          : `Apakah Anda yakin ingin mengaktifkan pengguna "${banModal.userName}"? Pengguna akan dapat login kembali.`
        }
        userName={banModal.userName || ''}
        isBanning={banModal.isBanning}
        currentUserId={currentUserId}
        targetUserId={banModal.targetUserId}
      />
    </div>
  )
}