"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { InvoicePrintout } from "@/components/purchase-order-invoice/po-invoice-printout"
import type { InvoiceDetail } from '@/components/purchase-order-invoice/po-invoice-action'

export function PurchaseOrderInvoiceClient({ purchaseOrder }: { purchaseOrder: InvoiceDetail }) {
  const handlePrint = () => {
    // Configure print settings for letter paper with minimal margins
    const printStyles = document.createElement('style')
    printStyles.innerHTML = `
      @page {
        size: letter portrait;
        margin: 0.5in;
      }
      @media print {
        html, body {
          background: white !important;
          background-image: none !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        * {
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .no-print {
          display: none !important;
        }
        .invoice-printout {
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          background: white !important;
          width: 100% !important;
          max-width: none !important;
        }
        /* Ensure no background graphics or colors interfere */
        body::before,
        body::after,
        *::before,
        *::after {
          display: none !important;
        }
      }
    `
    document.head.appendChild(printStyles)

    // Print the page
    window.print()

    // Clean up styles after printing
    setTimeout(() => {
      document.head.removeChild(printStyles)
    }, 1000)
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <div className="print:hidden">
          <SiteHeader />
        </div>
        <div className="flex flex-1">
          <div className="print:hidden">
            <AppSidebar />
          </div>
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 px-6 md:gap-6 md:py-6">
                  <div className="flex items-center justify-between print:hidden">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Purchase Order Invoice</h1>
                      <p className="text-muted-foreground">
                        Invoice for PO-{String(purchaseOrder.purchaseOrder.id).padStart(4, '0')}
                      </p>
                    </div>
                    <Button
                      onClick={handlePrint}
                      variant="default"
                      className="cursor-pointer text-md"
                      size="lg"
                    >
                      <Printer className="h-4 w-4" />
                      Print 
                    </Button>
                  </div>
                  <div className="flex-1">
                    <InvoicePrintout purchaseOrder={purchaseOrder} />
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            background-image: none !important;
          }
        }
      `}</style>
    </div>
  )
}