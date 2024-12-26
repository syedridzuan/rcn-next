"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { slugify } from "@/lib/utils"

interface RecipeItemData {
  content: string
}

interface RecipeSectionData {
  title: string
  type: string
  items: RecipeItemData[]
}

interface RecipeFormData {
  title: string
  description?: string
  shortDescription?: string
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  categoryId: string
  sections: RecipeSectionData[]
  tips?: string[]
  tags?: string[]
  isEditorsPick: boolean
}

// Basic create logic
export async function createRecipe(data: RecipeFormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Must be logged in to create recipe")
  }

  // Build a slug from the title
  const slug = slugify(data.title)

  // Check if recipe with that slug already exists
  const existingRecipe = await prisma.recipe.findUnique({ where: { slug } })
  if (existingRecipe) {
    throw new Error("A recipe with this title already exists")
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      categoryId: data.categoryId,
      userId: session.user.id,
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          type: section.type,
          items: {
            create: section.items.map((item) => ({ content: item.content })),
          },
        })),
      },
      tips: data.tips?.length
        ? {
            create: data.tips.map((t) => ({ content: t })),
          }
        : undefined,
      tags: data.tags?.length
        ? {
            connectOrCreate: data.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          }
        : undefined,
      isEditorsPick: data.isEditorsPick,
    },
  })

  revalidatePath("/dashboard/recipes")
  return { success: true, id: recipe.id }
}