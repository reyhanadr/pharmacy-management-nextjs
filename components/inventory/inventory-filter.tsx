"use client"

import { useState } from "react"
import { Filter as FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Product } from './inventory-action';

type FilterState = {
  category: string;
  stockMin: string;
  stockMax: string;
  priceMin: string;
  priceMax: string;
};

const CATEGORIES = [
  "Obat Resep",
  "Obat Bebas",
  "Vitamin",
  "Suplemen",
  "Alat Kesehatan",
  "Kosmetik",
  "Lainnya"
]

interface InventoryFilterProps {
  table: Table<Product>;
}

export function InventoryFilter({ table }: InventoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    stockMin: "",
    stockMax: "",
    priceMin: "",
    priceMax: "",
  })

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    const newFilters: { id: string; value: string | { min?: number; max?: number } }[] = [];

    // Filter kategori
    if (filters.category) {
      newFilters.push({
        id: 'category',
        value: filters.category
      });
    }

    // Filter stok
    if (filters.stockMin || filters.stockMax) {
      newFilters.push({
        id: 'stock',
        value: {
          min: filters.stockMin ? parseInt(filters.stockMin) : undefined,
          max: filters.stockMax ? parseInt(filters.stockMax) : undefined
        }
      });
    }

    // Filter harga beli
    if (filters.priceMin || filters.priceMax) {
      newFilters.push({
        id: 'price_buy',
        value: {
          min: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
          max: filters.priceMax ? parseFloat(filters.priceMax) : undefined
        }
      });
    }

    table.setColumnFilters(newFilters);
    setIsOpen(false);
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      stockMin: "",
      stockMax: "",
      priceMin: "",
      priceMax: "",
    })
    table.resetColumnFilters()
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative cursor-pointer">
          <FilterIcon className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filter Produk</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
            >
              Reset
            </Button>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stok</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.stockMin}
                    onChange={(e) => handleFilterChange('stockMin', e.target.value)}
                    min="0"
                  />
                  <div className="flex items-center">-</div>
                  <Input
                    type="number"
                    placeholder="Maks"
                    value={filters.stockMax}
                    onChange={(e) => handleFilterChange('stockMax', e.target.value)}
                    min={filters.stockMin || '0'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Harga Beli (Modal)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    min="0"
                  />
                  <div className="flex items-center">-</div>
                  <Input
                    type="number"
                    placeholder="Maks"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    min={filters.priceMin || '0'}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Terapkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
