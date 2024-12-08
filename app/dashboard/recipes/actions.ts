'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { auth } from '@/auth'

interface RecipeFormData {
  title: string
  description: string | null
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  image?: string | null
  categoryId: string
  sections: {
    title: string
    type: string
    items: {
      content: string
    }[]
  }[]
}

export async function createRecipe(data: RecipeFormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a recipe')
  }

  const slug = slugify(data.title)

  try {
    // Check if slug already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })

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
        image: data.image,
        slug,
        categoryId: data.categoryId,
        userId: session.user.id,
        sections: {
          create: data.sections.map(section => ({
            title: section.title,
            type: section.type,
            items: {
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      }
    })

    if (recipe) {
      revalidatePath('/dashboard/recipes')
      redirect('/dashboard/recipes')
    }
    
  } catch (error) {
    console.error('Create recipe error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create recipe')
  }
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error('You must be logged in to update a recipe')
    }

    // First, delete existing sections and items
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
        image: data.image,
        categoryId: data.categoryId,
        sections: {
          create: data.sections.map(section => ({
            title: section.title,
            type: section.type,
            items: {
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      }
    })

    revalidatePath('/dashboard/recipes')
  } catch (error) {
    console.error('Update recipe error:', error)
    throw new Error(typeof error === 'string' ? error : 'Failed to update recipe')
  }

  redirect('/dashboard/recipes')
}

export async function deleteRecipe(id: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to delete a recipe')
  }

  await prisma.recipe.delete({
    where: { 
      id,
      userId: session.user.id // Ensure user owns the recipe
    }
  })
  
  revalidatePath('/dashboard/recipes')
} 