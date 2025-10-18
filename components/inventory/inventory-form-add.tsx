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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Package, Save, Loader2 } from "lucide-react"
import { addProduct, getSuppliers } from "./inventory-action"

interface AddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdded?: () => void
}

type Supplier = {
  id: number
  name: string
}

export function AddProductModal({ open, onOpenChange, onProductAdded }: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    price_buy: "",
    price_sell: "",
    stock: "",
    supplier_id: "",
  })

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (open) {
      fetchSuppliers()
    }
  }, [open])

  const fetchSuppliers = async () => {
    setIsLoadingSuppliers(true)
    try {
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error(error instanceof Error ? error.message : "Gagal memuat data supplier")
    } finally {
      setIsLoadingSuppliers(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.code || !formData.price_buy || !formData.price_sell || !formData.stock) {
      toast.error("Harap lengkapi semua field yang wajib diisi")
      return
    }

    // Validate numbers
    const priceBuy = parseFloat(formData.price_buy)
    const priceSell = parseFloat(formData.price_sell)
    const stock = parseInt(formData.stock)

    if (isNaN(priceBuy) || priceBuy <= 0) {
      toast.error("Harga beli harus berupa angka yang valid dan lebih dari 0")
      return
    }

    if (isNaN(priceSell) || priceSell <= 0) {
      toast.error("Harga jual harus berupa angka yang valid dan lebih dari 0")
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast.error("Stok harus berupa angka yang valid dan tidak boleh negatif")
      return
    }

    if (priceSell <= priceBuy) {
      toast.error("Harga jual harus lebih besar dari harga beli")
      return
    }

    setIsLoading(true)

    try {
      const result = await addProduct({
        name: formData.name,
        code: formData.code,
        category: formData.category || null,
        price_buy: priceBuy,
        price_sell: priceSell,
        stock: stock,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
      })

      if (!result.success) {
        throw new Error(result.error || "Gagal menambahkan produk")
      }

      toast.success("Produk berhasil ditambahkan")

      // Reset form
      setFormData({
        name: "",
        code: "",
        category: "",
        price_buy: "",
        price_sell: "",
        stock: "",
        supplier_id: "",
      })

      onOpenChange(false)
      onProductAdded?.()
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menambahkan produk")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Tambah Produk Baru
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi produk yang akan ditambahkan ke inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="code">Kode Produk *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Masukkan kode produk"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Obat">Obat</SelectItem>
                    <SelectItem value="Vitamin">Vitamin</SelectItem>
                    <SelectItem value="Suplemen">Suplemen</SelectItem>
                    <SelectItem value="Alat Kesehatan">Alat Kesehatan</SelectItem>
                    <SelectItem value="Kosmetik">Kosmetik</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="price_buy">Harga Beli *</Label>
                <Input
                  id="price_buy"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_buy}
                  onChange={(e) => handleInputChange("price_buy", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="price_sell">Harga Jual *</Label>
                <Input
                  id="price_sell"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_sell}
                  onChange={(e) => handleInputChange("price_sell", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="stock">Stok Awal *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="supplier_id">Supplier</Label>
                <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange("supplier_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Menambahkan...
                </>
              ) : (
                <>
                  <Save className=" h-4 w-4" />
                  Tambah Produk
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}