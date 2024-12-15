
import type { Recipe } from './recipe'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  recipes: Recipe[]
  createdAt: Date
  updatedAt: Date
}
