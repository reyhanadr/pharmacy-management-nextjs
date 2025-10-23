"use client"

import React from "react"
import { CashierForm } from "@/components/cashier/cashier-form"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { toast } from "sonner"
import type { Product, Transaction, UserProfile } from "@/components/cashier/cashier-action"

interface NewTransactionPageClientProps {
  initialProducts: Product[]
  userData: UserProfile
}

export function NewTransactionPageClient({ initialProducts, userData }: NewTransactionPageClientProps) {
  const handleTransactionComplete = (transaction: Transaction) => {
    // Show success toast
    toast.success(`Transaksi berhasil! Total: Rp ${transaction.total.toLocaleString()}`, {
      description: `Transaksi dengan ID #${transaction.id} telah selesai diproses.`,
      duration: 5000,
    })
    // window.location.reload()
    // Log transaction for debugging
    console.log('Transaction completed:', transaction)

    // Optional: Could redirect to transaction history or reset form
    // For now, just show the toast notification
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
                      <h1 className="text-2xl font-bold tracking-tight">Transaksi Baru</h1>
                      <p className="text-muted-foreground">
                        Proses transaksi penjualan dengan mudah dan cepat. Pilih produk, tentukan jumlah, dan selesaikan pembayaran.
                      </p>
                    </div>

                  </div>
                  <CashierForm
                    initialProducts={initialProducts}
                    userData={userData}
                    onTransactionComplete={handleTransactionComplete}
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