
import type { Recipe } from './recipe'

export interface RecipeImage {
  id: string
  url: string
  thumbnailUrl: string
  mediumUrl: string
  alt: string | null
  description: string | null
  isPrimary: boolean
  recipeId: string
  recipe: Recipe
  createdAt: Date
  updatedAt: Date
}
