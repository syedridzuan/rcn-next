'use client'

import { useState } from 'react'
import { useSession } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ms } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: Date
  userId: string
  user: {
    name: string | null
    image: string | null
  }
}

interface CommentsWrapperProps {
  recipeId: string
  initialComments: Comment[]
}

export function CommentsWrapper({ recipeId, initialComments }: CommentsWrapperProps) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          recipeId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newComment = await response.json()
      setComments((prev) => [newComment, ...prev])
      setContent('')
    } catch (err) {
      setError('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const clonedResponse = response.clone()
        
        let errorMessage = 'Failed to delete comment'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          const errorText = await clonedResponse.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Ulasan berjaya dipadam')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memadam ulasan'
      console.error('Error deleting comment:', errorMessage)
      toast.error('Gagal memadam ulasan. Sila cuba lagi.')
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Kongsi pendapat anda tentang resipi ini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Menghantar...' : 'Hantar Ulasan'}
          </Button>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-lg text-center">
          <p>Sila log masuk untuk berkongsi ulasan anda.</p>
          <Button variant="link" className="mt-2" asChild>
            <a href="/login">Log Masuk</a>
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={comment.user.image || undefined} />
              <AvatarFallback>
                {comment.user.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ms,
                    })}
                  </span>
                </div>
                {session?.user?.id === comment.userId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Padam Ulasan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak boleh dibatalkan. Ulasan ini akan dipadam secara kekal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Padam
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground">
            Tiada ulasan lagi. Jadilah yang pertama berkongsi pendapat anda!
          </p>
        )}
      </div>
    </div>
  )
} 