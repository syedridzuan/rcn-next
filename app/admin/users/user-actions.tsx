"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

interface UserActionsProps {
  userId: string
  currentRole: string
  currentStatus: string
}

type ActionType = "promote" | "demote" | "suspend" | "activate"

export function UserActions({ userId, currentRole, currentStatus }: UserActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState<ActionType | null>(null)

  const actionMessages = {
    promote: "Are you sure you want to promote this user to admin?",
    demote: "Are you sure you want to remove admin privileges from this user?",
    suspend: "Are you sure you want to suspend this user? They will not be able to log in.",
    activate: "Are you sure you want to reactivate this user's account?",
  }

  async function handleAction(action: ActionType) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      toast.success(
        action === "promote" ? "User promoted to admin" :
        action === "demote" ? "Admin privileges removed" :
        action === "suspend" ? "User account suspended" :
        "User account activated"
      )
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${action} user`
      )
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentRole !== "ADMIN" ? (
            <DropdownMenuItem 
              onClick={() => setShowConfirmDialog("promote")}
            >
              Promote to Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowConfirmDialog("demote")}
            >
              Remove Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {currentStatus === "ACTIVE" ? (
            <DropdownMenuItem 
              onClick={() => setShowConfirmDialog("suspend")}
              className="text-destructive"
            >
              Suspend Account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowConfirmDialog("activate")}
            >
              Activate Account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog 
        open={!!showConfirmDialog} 
        onOpenChange={() => setShowConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {showConfirmDialog && actionMessages[showConfirmDialog]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showConfirmDialog && handleAction(showConfirmDialog)}
              className={showConfirmDialog === "suspend" ? "bg-destructive" : undefined}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 