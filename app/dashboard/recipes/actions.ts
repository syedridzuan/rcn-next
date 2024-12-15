'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { auth } from '@/auth'

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
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  categoryId: string
  sections: RecipeSectionData[]
  tips?: string[]
  tags?: string[]
  // image?: string
}



export async function createRecipe(data: RecipeFormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a recipe')
  }

  const slug = slugify(data.title)

  const existingRecipe = await prisma.recipe.findUnique({ where: { slug } })
  if (existingRecipe) {
    throw new Error('A recipe with this title already exists')
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      slug,
      categoryId: data.categoryId,
      userId: session.user.id,
      sections: {
        create: data.sections.map(section => ({
          title: section.title,
          type: section.type,
          items: {
            create: section.items.map(item => ({ content: item.content }))
          }
        }))
      },
      tips: data.tips?.length ? { create: data.tips.map(t => ({ content: t })) } : undefined,
      tags: data.tags?.length
        ? {
            connectOrCreate: data.tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        : undefined
    }
  })

  // No redirect here, just revalidate and return success info
  revalidatePath('/dashboard/recipes')
  return { success: true, id: recipe.id }
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('You must be logged in to update a recipe')
  }

  // First, remove existing sections, items, and tips
  await prisma.recipeItem.deleteMany({
    where: {
      section: {
        recipeId: id
      }
    }
  })

  await prisma.recipeSection.deleteMany({
    where: {
      recipeId: id
    }
  })

  await prisma.recipeTip.deleteMany({
    where: {
      recipeId: id
    }
  })

  // Disconnect all tags
  await prisma.recipe.update({
    where: { id },
    data: { tags: { set: [] } }
  })

  // Now update the recipe with new data
  await prisma.recipe.update({
    where: { 
      id,
      userId: session.user.id
    },
    data: {
      title: data.title,
      description: data.description,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      categoryId: data.categoryId,
      sections: {
        create: data.sections.map(section => ({
          title: section.title,
          type: section.type,
          items: {
            create: section.items.map(it => ({ content: it.content }))
          }
        }))
      },
      tips: data.tips?.length
        ? { create: data.tips.map(t => ({ content: t })) }
        : undefined,
      tags: data.tags?.length
        ? {
            connectOrCreate: data.tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/recipes')
  return { success: true }
}

// Delete a recipe
export async function deleteRecipe(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('You must be logged in to delete a recipe')
    }
  
    await prisma.recipe.delete({
      where: { 
        id,
        userId: session.user.id
      }
    })
    
    revalidatePath('/dashboard/recipes')
  }