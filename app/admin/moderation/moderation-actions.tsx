"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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

interface ModerationActionsProps {
  commentId: string
}

export function ModerationActions({ commentId }: ModerationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  async function handleAction(action: "approve" | "reject") {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/comments/${commentId}/${action}`, {
        method: "POST",
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      toast.success(
        action === "approve" 
          ? "Comment approved successfully" 
          : "Comment rejected"
      )
      
      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${action} comment`
      )
    } finally {
      setIsLoading(false)
      setShowRejectDialog(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction("approve")}
          disabled={isLoading}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading}
        >
          Reject
        </Button>
      </div>

      <AlertDialog 
        open={showRejectDialog} 
        onOpenChange={setShowRejectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this comment? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("reject")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 