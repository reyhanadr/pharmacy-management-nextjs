'use client';

import { useState } from 'react';
import { User as UserData } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Globe, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import createClient from '@/utils/supabase/client';

interface UserMenuProps {
  user: UserData | null;
  profile: {
    display_name: string;
    email: string;
    avatar_url?: string;
  } | null;
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Refresh halaman atau arahkan ke login
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Gagal keluar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile?.avatar_url || '/placeholder-user.jpg'}
              alt={profile?.display_name || 'User'}
              className="object-cover"
            />
            <AvatarFallback>
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={profile?.avatar_url || '/placeholder-user.jpg'}
              alt={profile?.display_name || 'User'}
              className="object-cover"
            />
            <AvatarFallback>
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium truncate">{profile?.display_name || 'User'}</p>
            {profile?.email && (
              <p className="text-xs text-muted-foreground truncate">{profile.email.substring(0, 10)}...{profile.email.substring(profile.email.length - 10)}</p>
            )}
          </div>
        </div>
        <Link href="/account" passHref>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Akun Saya</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/public-chat" passHref>
          <DropdownMenuItem className="cursor-pointer">
            <Globe className="mr-2 h-4 w-4" />
            <span>Global Chat</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/chat" passHref>
          <DropdownMenuItem className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Private Chat</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/account/settings" passHref>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Pengaturan Akun</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem asChild>
          <button
            className="flex w-full items-center cursor-pointer"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoading ? 'Memproses...' : 'Keluar'}</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}