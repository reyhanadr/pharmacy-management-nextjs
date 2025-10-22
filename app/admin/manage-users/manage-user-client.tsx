"use client"

import React from "react"
import { ManageUsersList } from "@/components/manage-users/manage-users-list"
import { ManageUsersAddModal } from "@/components/manage-users/manage-users-add-modal"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Button } from "@/components/ui/button"
import { UserPlus  } from "lucide-react"
import type { User } from "@/components/manage-users/manage-users-action"

interface ManageUserPageClientProps {
  initialUsers: User[]
  currentUserId: string
}

export function ManageUsersPageClient({ initialUsers, currentUserId }: ManageUserPageClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>(initialUsers)

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [newUser, ...prev])
    // Note: In a real implementation, you might want to refresh from server
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
                      <h1 className="text-2xl font-bold tracking-tight">Daftar Pegawai</h1>
                      <p className="text-muted-foreground">
                        Kelola pegawai Anda
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        <UserPlus  className="h-4 w-4" />
                          Pegawai
                      </Button>
                    </div>
                  </div>
                  <ManageUsersList initialUsers={users} currentUserId={currentUserId} />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <ManageUsersAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onUserAdded={handleUserAdded}
      />
    </div>
  )
}