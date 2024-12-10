// types/category.ts
export interface RecipeImage {
    id: string;
    url: string;
    mediumUrl: string;
    thumbnailUrl: string;
    alt: string | null;
    isPrimary: boolean;
  }
  
  export interface Recipe {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    language: string;
    cookTime: number;
    prepTime: number;
    servings: number;
    difficulty: string;
    images: RecipeImage[];
  }
  
  export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    recipes: Recipe[];
  }
  
  export type CategoryWithRecipes = Category & {
    recipes: Recipe[];
  };