import type { Recipe } from './recipe'

export interface RecipeTip {
  id: string
  content: string
  recipeId: string
  recipe: Recipe
  createdAt: Date
  updatedAt: Date
}