"use client"

import React from "react"
import { CashierForm } from "@/components/cashier/cashier-form"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditLogTable, StockLogTable } from "@/components/audit-log/audit-log-table"
import { toast } from "sonner"
import type { Product, Transaction, UserProfile } from "@/components/cashier/cashier-action"
import type { AuditLog, StockLog } from "@/components/audit-log/audit-log-action"

interface AuditLogPageClientProps {
  initialProducts: Product[]
  userData: UserProfile
  initialAuditLogs: AuditLog[]
  initialStockLogs: StockLog[]
}

export function AuditLogPageClient({
  initialProducts,
  userData,
  initialAuditLogs,
  initialStockLogs
}: AuditLogPageClientProps) {
  const handleTransactionComplete = (transaction: Transaction) => {
    // Show success toast
    toast.success(`Transaksi berhasil! Total: Rp ${transaction.total.toLocaleString()}`, {
      description: `Transaksi dengan ID #${transaction.id} telah selesai diproses.`,
      duration: 5000,
    })
    window.location.reload()
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
                      <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
                      <p className="text-muted-foreground">
                        Pantau semua aktivitas sistem dan pergerakan stok
                      </p>
                    </div>
                  </div>

                  <Tabs defaultValue="audit-logs" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
                      <TabsTrigger value="stock-logs">Stock Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="audit-logs" className="space-y-6">
                      <AuditLogTable
                        initialLogs={initialAuditLogs}
                        title="Audit Logs"
                        description="Riwayat semua perubahan data dalam sistem"
                      />
                    </TabsContent>

                    <TabsContent value="stock-logs" className="space-y-6">
                      <StockLogTable
                        initialLogs={initialStockLogs}
                        title="Stock Logs"
                        description="Riwayat pergerakan stok masuk dan keluar"
                      />
                    </TabsContent>
                  </Tabs>

                  {/* Transaction Form for Testing */}
                  {/* <div className="mt-8">
                    <CashierForm
                      initialProducts={initialProducts}
                      userData={userData}
                      onTransactionComplete={handleTransactionComplete}
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}