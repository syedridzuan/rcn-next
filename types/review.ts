import { ReviewStatus } from '@prisma/client'
import type { User } from './user'
import type { Recipe } from './recipe'

export interface Review {
  id: string
  rating: number
  reviewText: string | null
  userId: string
  user: User
  recipeId: string
  recipe: Recipe
  status: ReviewStatus
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}