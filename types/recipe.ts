export interface Recipe {
  id: string
  title: string
  description?: string
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  slug: string
  categoryId: string
  userId: string
  sections: {
    id: string
    title: string
    type: string // 'INGREDIENTS' | 'INSTRUCTIONS'
    items: {
      id: string
      content: string
    }[]
  }[]
  category?: {
    id: string
    name: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

interface RecipeImage {
  id: string;
  url: string;
  mediumUrl: string;
  thumbnailUrl: string;
  alt?: string;
  isPrimary: boolean;
}

export interface RecipeFormData {
  title: string
  description?: string
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

