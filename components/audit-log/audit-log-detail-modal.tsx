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
import { User, Database, FileText, Clock } from "lucide-react"
import { formatDate } from "@/components/utils/format-date"
import type { AuditLog } from "./audit-log-action"

interface AuditLogDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditLog: AuditLog | null
}

export function AuditLogDetailModal({
  open,
  onOpenChange,
  auditLog,
}: AuditLogDetailModalProps) {
  if (!auditLog) return null

  const getActionBadge = (action: string) => {
    const variants = {
      insert: { variant: "default" as const, label: "Tambah", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      update: { variant: "secondary" as const, label: "Ubah", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      delete: { variant: "destructive" as const, label: "Hapus", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[action as keyof typeof variants] || variants.update
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="h-5 w-5" />
            Detail Audit Log
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang aktivitas sistem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Activity Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Aktivitas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Aksi:</span>
                    <div className="text-right">
                      {getActionBadge(auditLog.action_type)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Tabel:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-right">
                      {auditLog.table_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Record ID:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-right">
                      {auditLog.record_id || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - User & Time */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  User & Waktu
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {auditLog.user_profile?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {auditLog.user_profile?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {formatDate(auditLog.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(auditLog.created_at).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Detail Perubahan
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm">
                    <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded border">
                      {JSON.stringify(auditLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}