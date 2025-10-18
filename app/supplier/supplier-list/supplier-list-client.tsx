"use client"

import React from "react"
import { SupplierList } from "@/components/supplier/supplier-list"
import { AddSupplierModal } from "@/components/supplier/supplier-add-modal"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Supplier } from "@/components/supplier/supplier-action"

interface SupplierListPageClientProps {
  initialSuppliers: Supplier[]
}

export function SupplierListPageClient({ initialSuppliers }: SupplierListPageClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  const handleSupplierAdded = () => {
    // Refresh the page to get updated suppliers
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
                      <h1 className="text-2xl font-bold tracking-tight">Daftar Supplier</h1>
                      <p className="text-muted-foreground">
                        Kelola data supplier Anda
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer"
                        variant="default"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Supplier
                      </Button>
                    </div>
                  </div>
                  <SupplierList initialSuppliers={initialSuppliers} onAddSupplier={handleSupplierAdded} />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <AddSupplierModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  )
}