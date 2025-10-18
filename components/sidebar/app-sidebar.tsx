"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "lucide-react"
import { AddProductModal } from "@/components/inventory/inventory-add-modal"
import { AddSupplierModal } from "@/components/supplier/supplier-add-modal"

import { NavTransaction } from "@/components/sidebar-navigation/nav-transaction"
import { NavMasterData } from "@/components/sidebar-navigation/nav-master-data"
import { NavAdmin } from "@/components/sidebar-navigation/nav-admin"
import { NavFooter } from "@/components/sidebar-navigation/nav-footer"
import { NavUser } from "@/components/sidebar-navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { data } from "./config-sidebar"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = React.useState(false)

  const handleProductAdded = () => {
    // Navigate to inventory list page after product is added
    router.push('/inventory/inventory-list')
    window.location.reload()
  }

  const handleSupplierAdded = () => {
    // Refresh the page to get updated suppliers
    router.push('/supplier/supplier-list')
    window.location.reload()
  }

  return (
    <>
      <Sidebar
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Pharmacy Management</span>
                    <span className="truncate text-xs">System</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavTransaction items={data.navTransactions} />
          <NavMasterData 
            inventoryItems={data.navInventory} 
            supplierItems={data.navSupplier} 
            onOpenAddModal={() => setIsAddModalOpen(true)} 
            onOpenAddSupplierModal={() => setIsAddSupplierModalOpen(true)} 
          />
          <NavAdmin projects={data.navAdmin} />
          <NavFooter items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onProductAdded={handleProductAdded}
      />
      <AddSupplierModal
        open={isAddSupplierModalOpen}
        onOpenChange={setIsAddSupplierModalOpen}
        onSupplierAdded={handleSupplierAdded}
      />
    </>
  )
}
