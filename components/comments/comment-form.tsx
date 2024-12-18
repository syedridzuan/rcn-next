"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateCommentSchema, type CreateCommentInput } from "@/types/comments"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { CommentWithUser } from "@/types/comments"

interface CommentFormProps {
  recipeId: string
  parentId?: string
  onSubmit: (comment: CommentWithUser) => void
  onCancel?: () => void
}

export function CommentForm({ 
  recipeId, 
  parentId, 
  onSubmit, 
  onCancel 
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(CreateCommentSchema),
    defaultValues: {
      content: "",
      recipeId,
      parentId: parentId || null,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted') // Debug log
    
    try {
      const payload = {
        content: form.getValues().content,
        recipeId,
        parentId
      }
      console.log("Sending comment payload:", payload)

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        })
        throw new Error("Failed to post comment")
      }

      const comment = await response.json()
      console.log('API data:', comment) // Debug log

      onSubmit(comment)
      form.reset()
    } catch (error) {
      console.error("Error posting comment:", {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      if (error instanceof Response) {
        const errorText = await error.text()
        console.error("API Response:", {
          status: error.status,
          statusText: error.statusText,
          body: errorText
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        {...form.register("content")}
        placeholder="Write a comment..."
        disabled={isSubmitting}
      />
      {form.formState.errors.content && (
        <p className="text-sm text-red-500">
          {form.formState.errors.content.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
} 