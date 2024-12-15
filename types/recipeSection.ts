import type { Recipe } from './recipe'
import type { RecipeItem } from './recipeItem'

export interface RecipeSection {
  id: string
  title: string
  type: string
  recipeId: string
  recipe: Recipe
  items: RecipeItem[]
  createdAt: Date
  updatedAt: Date
}