import type { User } from './user'
import type { Recipe } from './recipe'

export interface SavedRecipe {
  id: string
  userId: string
  user: User
  recipeId: string
  recipe: Recipe
  notes: string | null
  createdAt: Date
  updatedAt: Date
}
