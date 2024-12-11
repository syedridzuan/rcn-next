export interface Recipe {
  id: string
  title: string
  slug: string
  cookTime: number
  prepTime: number
  images: RecipeImage[]
  category: Category
}

export interface RecipeImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface Category {
  id: string
  name: string
}

export interface SavedRecipe {
  id: string
  userId: string
  recipeId: string
  recipe: Recipe
  createdAt: Date
  updatedAt: Date
} 