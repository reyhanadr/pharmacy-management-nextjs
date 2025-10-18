import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/layout/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SectionCards } from "@/components/dashboard/section-cards"
import { ChartAreaInteractive } from "@/components/dashboard/section-chart"
import { getCurrentUser } from "@/components/auth/auth.action"
import { redirect } from "next/navigation"
// import {DataTable} from "@/components/dashboard/section-table"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser()

  // If no user is logged in, redirect to login page
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
