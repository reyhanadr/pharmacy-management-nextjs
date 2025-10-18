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
import { Calendar, Edit, Package, TrendingUp, Truck, Phone, Mail, MapPin, User } from "lucide-react"

interface Supplier {
  id: number
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

interface SupplierDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onEdit: () => void
}

export function SupplierDetailModal({
  open,
  onOpenChange,
  supplier,
  onEdit,
}: SupplierDetailModalProps) {
  if (!supplier) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Truck className="h-5 w-5" />
            Detail Supplier
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang supplier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Supplier
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Nama Supplier:</span>
                    <p className="text-lg font-semibold mt-1">{supplier.name}</p>
                  </div>
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Contact Person:</span>
                        <p className="text-sm">{supplier.contact_person}</p>
                      </div>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Telepon:</span>
                        <p className="text-sm">{supplier.phone}</p>
                      </div>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Email:</span>
                        <p className="text-sm">{supplier.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Address & Status */}
            <div className="space-y-6">
              {supplier.address && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Alamat
                  </h3>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{supplier.address}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Status
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    Aktif
                  </Badge>
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
                  <p className="text-sm">{formatDate(supplier.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Diperbarui:</span>
                  <p className="text-sm">{formatDate(supplier.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button className="cursor-pointer" variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Supplier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}