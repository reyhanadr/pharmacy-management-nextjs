"use client"

import {
  Settings,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import createClient from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

async function getCurrentUserClient(): Promise<UserProfile | null> {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userProfile = await getCurrentUserClient()
        setUser(userProfile)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Refresh halaman atau arahkan ke login
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Gagal keluar. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">?</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={`/avatars/${user.id}.jpg`} alt={user.full_name} />
                <AvatarFallback className="rounded-lg">
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.full_name}</span>
                <span className="truncate text-xs capitalize">[{user.role}]</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal"> 
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={`/avatars/${user.id}.jpg`} alt={user.full_name} />
                  <AvatarFallback className="rounded-lg">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.full_name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell />
                Notifikasi
              </DropdownMenuItem>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings />
                  Pengaturan Akun
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
              <LogOut className="text-destructive"/>
              {isLoading ? 'Signing out...' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
