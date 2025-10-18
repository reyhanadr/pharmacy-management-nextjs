"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Edit } from "lucide-react"
import { updateSupplier } from "./supplier-action"
import type { Supplier } from "./supplier-action"

interface EditSupplierModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSupplierUpdated?: () => void
}

export function EditSupplierModal({ open, onOpenChange, supplier, onSupplierUpdated }: EditSupplierModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  })

  // Populate form when supplier changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
      })
    }
  }, [supplier])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplier) return

    // Basic validation
    if (!formData.name) {
      toast.error("Nama supplier wajib diisi")
      return
    }

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Format email tidak valid")
      return
    }

    setIsLoading(true)

    try {
      const result = await updateSupplier(supplier.id, {
        name: formData.name,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
      })

      if (!result.success) {
        throw new Error(result.error || "Gagal mengupdate supplier")
      }

      toast.success("Supplier berhasil diupdate")

      onOpenChange(false)
      onSupplierUpdated?.()
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate supplier")
    } finally {
      setIsLoading(false)
    }
  }

  if (!supplier) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="h-5 w-5" />
            Edit Supplier
          </DialogTitle>
          <DialogDescription>
            Update informasi supplier yang ada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="name">Nama Supplier *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Masukkan nama supplier"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange("contact_person", e.target.value)}
                  placeholder="Masukkan nama contact person"
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Masukkan email supplier"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2" htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Masukkan alamat lengkap supplier"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengupdate...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Supplier
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}