"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import type { PurchaseOrderResponse } from '@/components/purchase-order/purchase-order-action';
import { PurchaseOrderList } from '@/components/purchase-order/purchase-order-manage-list';


export function ManagePurchaseOrderClient({ initialPurchaseOrders }: { initialPurchaseOrders: PurchaseOrderResponse[] }) {

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
                      <h1 className="text-2xl font-bold tracking-tight">Daftar Purchase Order </h1>
                      <p className="text-muted-foreground">
                        Kelola purchase order dengan mudah. Lihat daftar lengkap beserta status terkini, serta akses dan cetak invoice sesuai kebutuhan.
                      </p>
                    </div>
                  </div>
                  <PurchaseOrderList
                    initialPurchaseOrders={initialPurchaseOrders}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}