import type { RecipeSection } from './recipeSection'

export interface RecipeItem {
  id: string
  content: string
  sectionId: string
  section: RecipeSection
  createdAt: Date
  updatedAt: Date
}
