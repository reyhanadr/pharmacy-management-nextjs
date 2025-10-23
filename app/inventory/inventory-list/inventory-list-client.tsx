"use client"

import React from "react"
import { InventoryList } from "@/components/inventory/inventory-list"
import { AddProductModal } from "@/components/inventory/inventory-add-modal"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Button } from "@/components/ui/button"
import { PackagePlus  } from "lucide-react"
import type { Product } from "@/components/inventory/inventory-action"

interface InventoryListPageClientProps {
  initialProducts: Product[]
}

export function InventoryListPageClient({ initialProducts }: InventoryListPageClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  const handleProductAdded = () => {
    // Refresh the page to get updated products
    window.location.reload()
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col ">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 px-6 md:gap-6 md:py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Daftar Inventory</h1>
                      <p className="text-muted-foreground">
                        Kelola produk dan stok inventory Anda
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer"
                        variant="default"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        <PackagePlus className="mr-1 h-4 w-4" />
                        Produk
                      </Button>
                    </div>
                  </div>
                  <InventoryList initialProducts={initialProducts} />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onProductAdded={handleProductAdded}
      />
    </div>
  )
}