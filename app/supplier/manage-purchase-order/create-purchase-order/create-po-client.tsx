"use client"

import React from "react"
// import { SupplierList } from "@/components/supplier/supplier-list"
import { AddSupplierModal } from "@/components/supplier/supplier-add-modal"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
// import { Button } from "@/components/ui/button"
// import { Plus } from "lucide-react"
import type { UserProfile } from "@/components/auth/auth.action"
import { PurchaseOrderForm } from '@/components/purchase-order/purchase-order-form';

interface CreatePurchaseOrderClientProps {
    userData: UserProfile;
}

export function CreatePurchaseOrderClient({ userData }: CreatePurchaseOrderClientProps) {
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
                      <h1 className="text-2xl font-bold tracking-tight">Buat Purchase Order</h1>
                      <p className="text-muted-foreground">
                        Buat purchase order baru
                      </p>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer"
                        variant="default"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Supplier
                      </Button>
                    </div> */}
                  </div>
                    <PurchaseOrderForm
                        userData={userData}
                        onSuccess={() => {
                        // You can add success handling here, like redirecting to purchase history
                        console.log('Purchase order created successfully');
                        }}
                    />
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