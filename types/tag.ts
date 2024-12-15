import type { Guide } from './guide'
import type { Recipe } from './recipe'

export interface Tag {
  id: string
  name: string
  guides: Guide[]
  recipes: Recipe[]
  createdAt: Date
  updatedAt: Date
}
