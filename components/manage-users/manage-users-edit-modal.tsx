"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, User as UserIcon, Shield, Mail, Loader2, Lock } from "lucide-react"
import { updateUser } from "./manage-users-action"
import { toast } from "sonner"
import type { User } from "./manage-users-action"

interface ManageUsersEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onUserUpdated: () => void
}

export function ManageUsersEditModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: ManageUsersEditModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    full_name: '',
    username: '',
    email: '',
    role: 'pegawai' as 'owner' | 'pegawai',
    password: '',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email,
        role: user.role,
        password: '',
      })
      setErrors({})
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter'
    }

    if (!formData.role) {
      newErrors.role = 'Role wajib dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validateForm()) return

    setIsLoading(true)

    try {
      const result = await updateUser(user.id, {
        role: formData.role,
        username: formData.username || null,
        full_name: formData.full_name || null,
        email: formData.email,
        password: formData.password,
      })

      if (!result.success) {
        throw new Error(result.error || "Gagal mengupdate pengguna")
      }

      toast.success("Pengguna berhasil diupdate")
      onUserUpdated()
      onOpenChange(false)

    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate pengguna")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            Edit Pengguna
          </DialogTitle>
          <DialogDescription>
            Update informasi pengguna sistem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Nama Lengkap
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Masukkan nama lengkap"
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (Opsional)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Masukkan username unik"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Masukkan alamat email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Masukkan password baru"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'owner' | 'pegawai') => handleInputChange('role', value)}
              >
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih role pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Pegawai
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Owner
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className='cursor-pointer'
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className='cursor-pointer'>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Update Pengguna'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}