// types/comment.ts
import { CommentStatus } from '@prisma/client'
import { User } from '@/types/user'
import { Recipe } from '@/types/recipe'

export interface Comment {
  id: string
  createdAt: Date
  updatedAt: Date
  content: string
  status: CommentStatus
  userId: string
  recipeId: string
  user: User
  recipe: Recipe
  parentId: string | null
  parent?: Comment   // Optional, when fetched with include
  replies?: Comment[] // Optional, when fetched with include
}
