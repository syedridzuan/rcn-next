import { z } from "zod"
import type { Comment, User } from "@prisma/client"

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "name" | "image">
  replies?: CommentWithUser[]
}

// Schema for creating a new comment
export const CreateCommentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long"),
  recipeId: z.string().uuid(),
  parentId: z.string().optional(),
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>