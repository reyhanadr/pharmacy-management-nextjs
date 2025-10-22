"use client"

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Shield, ShieldOff, AlertTriangle } from "lucide-react"

interface ManageUsersBanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  userName: string
  isBanning: boolean
  currentUserId?: string
  targetUserId?: string
}

export function ManageUsersBanModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  userName,
  isBanning,
  currentUserId,
  targetUserId,
}: ManageUsersBanModalProps) {
  // Check if this is the current user
  const isCurrentUser = targetUserId === currentUserId

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description.replace('{userName}', userName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600 text-white cursor-pointer"
            disabled={isCurrentUser}
          >
            {isCurrentUser ? (
              'Tidak dapat melakukan aksi pada diri sendiri'
            ) : (
              <>
                {isBanning ? (
                  <>
                    <ShieldOff className="h-4 w-4" />
                    Blokir
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Buka Blokir
                  </>
                )}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}