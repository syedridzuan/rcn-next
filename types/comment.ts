import { CommentStatus } from '@prisma/client'
import type { User } from './user'
import type { Recipe } from './recipe'

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
}
