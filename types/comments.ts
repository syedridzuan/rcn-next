import { z } from "zod"

// Using a const object for status values ensures type safety and consistency
export const COMMENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type CommentStatus = typeof COMMENT_STATUS[keyof typeof COMMENT_STATUS]

// Schema for comment creation with strict validation rules
export const CommentSchema = z.object({
  // Content must be a non-empty string with reasonable length limits
  content: z
    .string({
      required_error: "Comment content is required",
      invalid_type_error: "Comment content must be a string",
    })
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long (max 1000 characters)")
    .trim(), // Remove leading/trailing whitespace

  // Recipe ID must be a valid CUID
  recipeId: z
    .string({
      required_error: "Recipe ID is required",
      invalid_type_error: "Recipe ID must be a string",
    })
    .cuid("Invalid recipe ID format") // Using CUID since that's what Prisma uses
})

export type CommentInput = z.infer<typeof CommentSchema>

// API response type with detailed validation error support
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  details?: Array<{
    path: string[]
    message: string
  }>
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