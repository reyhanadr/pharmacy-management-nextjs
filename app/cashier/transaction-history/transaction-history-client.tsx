"use client"

import React from "react"
import { TransactionHistoryList } from "@/components/cashier/transaction-list"
import { TransactionHistoryHeader } from "@/components/cashier/transaction-history-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import type { Transaction } from "@/components/cashier/cashier-action"
import type { Product } from "@/components/cashier/cashier-action"

interface TransactionHistoryClientProps {
  initialTransactions: Transaction[]
  initialProducts: Product[]
}

export function TransactionHistoryClient({
  initialTransactions,
  initialProducts
}: TransactionHistoryClientProps) {
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
                  <TransactionHistoryHeader transactions={initialTransactions} />
                  <TransactionHistoryList
                    initialTransactions={initialTransactions}
                    initialProducts={initialProducts}
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