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

// CREATE a new recipe
export async function createRecipe(data: RecipeFormData) {
  // Ensure the user is logged in
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a recipe")
  }

  // Generate a unique slug for the recipe
  const slug = slugify(data.title)

  // Ensure no existing recipe with this slug
  const existingRecipe = await prisma.recipe.findUnique({
    where: { slug },
  })
  if (existingRecipe) {
    throw new Error("A recipe with this title already exists")
  }

  // Prepare auto-slugified tags
  // If the tag's slug already exists in DB, Prisma will just connect.
  // Otherwise, Prisma will create a new tag row.
  const tagsData = data.tags?.map((tagName) => {
    const tagSlug = slugify(tagName)
    return {
      where: { slug: tagSlug },
      create: { name: tagName, slug: tagSlug },
    }
  })

  await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      slug,
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
            create: data.tips.map((content) => ({ content })),
          }
        : undefined,
      tags: tagsData?.length
        ? {
            connectOrCreate: tagsData,
          }
        : undefined,
      isEditorsPick: data.isEditorsPick,
    },
  })

  // Revalidate your recipes dashboard path or wherever needed
  revalidatePath("/dashboard/recipes")
  return { success: true }
}

// UPDATE an existing recipe
export async function updateRecipe(id: string, data: RecipeFormData) {
  // Ensure the user is logged in
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a recipe")
  }

  // Check if the recipe exists
  const existingRecipe = await prisma.recipe.findUnique({
    where: { id },
  })
  if (!existingRecipe) {
    throw new Error(`Recipe with id ${id} not found`)
  }

  // Verify ownership
  if (existingRecipe.userId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this recipe.")
  }

  // Remove old sections, items, tips
  await prisma.recipeItem.deleteMany({
    where: { section: { recipeId: id } },
  })
  await prisma.recipeSection.deleteMany({
    where: { recipeId: id },
  })
  await prisma.recipeTip.deleteMany({
    where: { recipeId: id },
  })

  // Disconnect all tags so we can replace them with new data
  await prisma.recipe.update({
    where: { id },
    data: { tags: { set: [] } },
  })

  // Prepare auto-slugified tags
  const tagsData = data.tags?.map((tagName) => {
    const tagSlug = slugify(tagName)
    return {
      where: { slug: tagSlug },
      create: { name: tagName, slug: tagSlug },
    }
  })

  // Update the recipe
  await prisma.recipe.update({
    where: {
      id,
      userId: session.user.id, // prevents tampering by non-owners
    },
    data: {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      categoryId: data.categoryId,
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          type: section.type,
          items: {
            create: section.items.map((it) => ({ content: it.content })),
          },
        })),
      },
      tips: data.tips?.length
        ? { create: data.tips.map((content) => ({ content })) }
        : undefined,
      tags: tagsData?.length
        ? {
            connectOrCreate: tagsData,
          }
        : undefined,
      isEditorsPick: data.isEditorsPick,
    },
  })

  revalidatePath("/dashboard/recipes")
  return { success: true }
}

// DELETE a recipe
export async function deleteRecipe(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a recipe")
  }

  await prisma.recipe.delete({
    where: { 
      id,
      userId: session.user.id, // ensures only the owner can delete
    },
  })
  
  revalidatePath("/dashboard/recipes")
  return { success: true }
}