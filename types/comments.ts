import { z } from "zod"

// Using a const object for status values ensures type safety and consistency
export const COMMENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type CommentStatus = typeof COMMENT_STATUS[keyof typeof COMMENT_STATUS]

// Schema for comment creation
export const CommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long")
    .trim(),
  recipeId: z.string().min(1, "Recipe ID is required"),
})

export type CommentInput = z.infer<typeof CommentSchema>

// API response type
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  details?: z.ZodError['errors']
}

// Comment type for frontend use
export type Comment = {
  id: string
  content: string
  status: CommentStatus
  userId: string
  recipeId: string
  createdAt: Date
  updatedAt: Date
  user: {
    name: string | null
  }
} 