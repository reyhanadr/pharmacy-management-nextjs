"use client"

import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function NavMasterData({
  inventoryItems,
  supplierItems,
  onOpenAddModal,
  onOpenAddSupplierModal,
}: {
  inventoryItems: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  supplierItems: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  onOpenAddModal?: () => void
  onOpenAddSupplierModal?: () => void
}) {
  return (
    <>
    <SidebarGroup>
      <SidebarGroupLabel>Master Data (Inventory)</SidebarGroupLabel>
      <SidebarGroupContent>
        {/* Inventory Section */}
        <SidebarMenu>
          {inventoryItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                {item.title === "Tambah Barang Baru" && onOpenAddModal ? (
                  <button
                    onClick={onOpenAddModal}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup>
      <SidebarGroupLabel>Master Data (Supplier)</SidebarGroupLabel>
      <SidebarGroupContent>
        {/* Supplier Section */}
        <SidebarMenu>
          {supplierItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                {item.title === "Tambah Supplier" && onOpenAddSupplierModal ? (
                  <button
                    onClick={onOpenAddSupplierModal}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    </>

  )
}
