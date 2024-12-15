"use client"

import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import type { CommentWithUser } from "@/types/comments"
import { Button } from "@/components/ui/button"

interface CommentItemProps {
  comment: CommentWithUser
  onReplyClick?: () => void
  canReply?: boolean
}

export function CommentItem({ 
  comment, 
  onReplyClick, 
  canReply = false 
}: CommentItemProps) {
  const { data: session } = useSession()
  const isAuthor = session?.user?.id === comment.userId

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete comment")
      }

      // Refresh the page or update comments list
      window.location.reload()
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {comment.user.image && (
            <img
              src={comment.user.image}
              alt={comment.user.name || "User"}
              className="h-6 w-6 rounded-full"
            />
          )}
          <span className="font-medium">{comment.user.name || "Anonymous"}</span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReplyClick}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Reply
            </Button>
          )}
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-muted-foreground">{comment.content}</p>
    </div>
  )
} 