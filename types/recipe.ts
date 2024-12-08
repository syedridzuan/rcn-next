export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  tips: {
    id: string
    content: string
  }[]
  // ... other properties
}

interface RecipeImage {
  id: string;
  url: string;
  mediumUrl: string;
  thumbnailUrl: string;
  alt?: string;
  isPrimary: boolean;
}

