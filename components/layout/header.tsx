"use client"

import { PanelLeft } from "lucide-react"
import { usePathname } from "next/navigation"

import { SearchForm } from "@/components/search/search-form"
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  // Function to generate breadcrumbs from pathname
  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean)

    if (segments.length === 0) {
      return [
        { label: 'Dashboard', href: '/' }
      ]
    }

    const breadcrumbs: Array<{ label: string; href?: string }> = [
      { label: 'Dashboard', href: '/' }
    ]

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)

      // Special cases for better readability
      switch (segment) {
        case 'inventory-list':
          label = 'Inventory List'
          break
        case 'suppliers':
          label = 'Suppliers'
          break
        case 'reports':
          label = 'Reports'
          break
        default:
          // Convert kebab-case to Title Case
          label = segment.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
      }

      // Last segment is the current page (no href)
      if (index === segments.length - 1) {
        breadcrumbs.push({ label })
      } else {
        breadcrumbs.push({ label, href: currentPath })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center px-4">
        {/* Left side - Sidebar toggle and navigation */}
        <div className="flex items-center gap-2">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <PanelLeft />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href || breadcrumb.label} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink className="cursor-pointer ml-1" href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="ml-1">{breadcrumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side - Search and theme switcher */}
        <div className="ml-auto flex items-center gap-2">
          <SearchForm className="w-full sm:w-auto" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
