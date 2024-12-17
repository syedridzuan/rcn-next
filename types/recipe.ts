import { RecipeDifficulty, RecipeStatus } from '@prisma/client'
import type { Category } from './category'
import type { User } from './user'
import type { RecipeSection } from './recipeSection'
import type { RecipeImage } from './recipeImage'
import type { Comment } from './comment'
import type { RecipeTip } from './recipeTip'
import type { Tag } from './tag'
import type { Review } from './review'
import type { SavedRecipe } from './savedRecipe'

export interface Recipe {
  id: string
  title: string
  slug: string
  description: string | null
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: RecipeDifficulty
  status: RecipeStatus
  categoryId: string
  userId: string
  category: Category
  user: User
  sections: RecipeSection[]
  images: RecipeImage[]
  comments: Comment[]
  tips: RecipeTip[]
  tags: Tag[]
  isEditorsPick: boolean
  createdAt: Date
  updatedAt: Date
  reviews: Review[]
  avgRating: number | null
  numReviews: number
  savedBy: SavedRecipe[]
}


export interface RecipeFormData {
  title: string
  description: string
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  categoryId: string
  sections: {
    title: string
    type: string
    items: {
      content: string
    }[]
  }[]
}

