"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import type { CommentWithUser } from "@/types/comments"
import { Button } from "@/components/ui/button"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"

interface CommentsWrapperProps {
  recipeId: string
  initialComments: CommentWithUser[]
}

export function CommentsWrapper({ recipeId, initialComments }: CommentsWrapperProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleCommentSubmit = async (newComment: CommentWithUser) => {
    console.log('handleCommentSubmit called with:', newComment)

    try {
      if (newComment.parentId) {
        console.log('Adding reply to parent:', newComment.parentId)
        setComments(comments.map(comment => {
          if (comment.id === newComment.parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            }
          }
          return comment
        }))
      } else {
        console.log('Adding new top-level comment')
        setComments([newComment, ...comments])
      }
      setReplyingTo(null)
    } catch (error) {
      console.error('Error in handleCommentSubmit:', error)
    }
  }

  console.log('Current comments:', comments)

  return (
    <div className="space-y-6">
      {session?.user && !replyingTo && (
        <CommentForm 
          recipeId={recipeId}
          onSubmit={handleCommentSubmit}
        />
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentItem
              comment={comment}
              onReplyClick={() => setReplyingTo(comment.id)}
              canReply={!comment.parentId && !!session?.user}
            />
            
            {replyingTo === comment.id && (
              <div className="ml-8">
                <CommentForm
                  recipeId={recipeId}
                  parentId={comment.id}
                  onSubmit={handleCommentSubmit}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}

            {comment.replies?.length > 0 && (
              <div className="ml-8 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    canReply={false}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 