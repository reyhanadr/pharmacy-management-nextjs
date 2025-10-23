"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Edit, User as UserIcon, Shield, Mail, Clock, ShieldOff, ShieldCheck, PencilOff } from "lucide-react"
import type { User } from "./manage-users-action"
import { getUserBanStatus } from "./manage-users-action"
import { useState, useEffect } from "react"
import { UserRoleBadge } from "./user-role-badge"
import { UserBanStatusBadge } from "./user-ban-status-badge"

interface ManageUsersDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onEdit?: () => void
  onBan?: () => void
  currentUserId?: string
}

export function ManageUsersDetailModal({
  open,
  onOpenChange,
  user,
  onEdit,
  onBan,
  currentUserId,
}: ManageUsersDetailModalProps) {
  // Check if user is banned
  const [banStatus, setBanStatus] = useState<{isBanned: boolean}>({isBanned: false})

  // Check if this is the current user
  const isCurrentUser = user?.id === currentUserId

  // Load ban status when modal opens
  useEffect(() => {
    if (open && user) {
      getUserBanStatus(user.id)
        .then(status => setBanStatus(status))
        .catch(error => {
          console.log('Error loading ban status:', error)
          setBanStatus({isBanned: false})
        })
    }
  }, [open, user])

  if (!user) return null

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAccountAge = (created_at: string) => {
    const created = new Date(created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} hari yang lalu`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} bulan yang lalu`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} tahun yang lalu`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserIcon className="h-5 w-5" />
            Detail Pengguna
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang pengguna sistem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - User Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Pengguna
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Nama Lengkap:</span>
                    <p className="text-base font-semibold mt-1">
                      {user.full_name || (
                        <span className="text-muted-foreground italic">Belum diisi</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Username:</span>
                    <p className="text-base font-mono mt-1">
                      {user.username || (
                        <span className="text-muted-foreground italic">Belum diisi</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">Email:</span>
                      <p className="text-base font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">Role:</span>
                      <UserRoleBadge role={user.role} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Status & Activity */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Status & Aktivitas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserBanStatusBadge isBanned={banStatus.isBanned} />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'Baru' : 'Lama'}
                      </div>
                      <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 block">Bergabung:</span>
                      <p className="text-sm">{getAccountAge(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Riwayat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Dibuat:</span>
                  <p className="text-sm">{formatDateOnly(user.created_at)}</p>
                </div>
              </div>
              {user.updated_at && (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Diperbarui:</span>
                    <p className="text-sm">{formatDateOnly(user.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {onBan && (
              <Button
                className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white"
                variant="default"
                onClick={onBan}
                disabled={isCurrentUser}
              >
                
                {isCurrentUser ? (
                  <PencilOff className="h-4 w-4" />
                ) : (
                  <>
                    {banStatus.isBanned ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                    {banStatus.isBanned ? 'Aktifkan' : 'Nonaktifkan'}
                  </>
                )}
              </Button>
            )}
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={onEdit}
              disabled={isCurrentUser}
            >
              
              {isCurrentUser ? <PencilOff className="h-4 w-4" /> : <><Edit className="h-4 w-4" /> Edit </>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}