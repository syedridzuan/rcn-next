"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Comment } from "@/types/comments"
import { formatDistanceToNow } from "date-fns"

interface CommentsWrapperProps {
  recipeId: string
  initialComments: Comment[]
}

export function CommentsWrapper({ recipeId, initialComments }: CommentsWrapperProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: content.trim(), 
          recipeId 
        }),
      })

      const data = await res.json()
      if (!data.success) {
        if (data.details) {
          const errors = data.details.map((err: any) => err.message).join(", ")
          throw new Error(errors)
        }
        throw new Error(data.error || "Failed to add comment")
      }

      // Show appropriate message for pending comments
      if (data.isPending) {
        toast.info(
          data.message || "Your comment is under review", 
          {
            description: data.reason,
            duration: 5000,
          }
        )
        setContent("")
        return
      }

      // Add new comment to the list only if not pending
      setComments((prev) => [data.data, ...prev])
      setContent("")
      toast.success("Comment added successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      toast.success("Comment deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment")
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Comments</h2>

      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          <Button 
            type="submit"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <div className="rounded-lg bg-muted p-4">
          <p>Please <Button variant="link" onClick={() => router.push("/login")}>log in</Button> to leave a comment.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="rounded-lg border p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name || "Anonymous"}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {session?.user?.id === comment.userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 