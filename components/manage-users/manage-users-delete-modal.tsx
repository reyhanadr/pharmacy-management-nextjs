"use client"

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
import { Trash2 } from "lucide-react"

interface ManageUsersDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  currentUserId?: string
  targetUserId?: string
}

export function ManageUsersDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  currentUserId,
  targetUserId,
}: ManageUsersDeleteModalProps) {
  // Check if this is the current user (single deletion) or if current user is in selection (multiple deletion)
  const isCurrentUser = (targetUserId && currentUserId) ?
    (targetUserId === currentUserId || targetUserId.includes(currentUserId)) :
    false

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer text-white"
            disabled={isCurrentUser}
          >
            {isCurrentUser ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Tidak dapat hapus diri sendiri
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}