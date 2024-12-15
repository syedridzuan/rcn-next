'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { auth } from '@/auth'
import { RecipeFormData } from '@/types/recipe'

export async function createRecipe(data: RecipeFormData) {
  try {
    // 1. Validate input data
    if (!data || !data.title) {
      throw new Error("Recipe data is required")
    }

    // 2. Get authenticated session
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      throw new Error('Unauthorized: You must be logged in to create a recipe')
    }

    // 3. Generate and validate slug
    const slug = slugify(data.title)
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })

    if (existingRecipe) {
      throw new Error('A recipe with this title already exists')
    }

    // 4. Create the recipe with all its relations
    console.log('Creating recipe:', data)
    
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description || '',
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
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    })

    // 5. Revalidate and redirect on success
    if (recipe) {
      console.log('Recipe created successfully:', recipe)
      revalidatePath('/dashboard/recipes')
      return { success: true, recipe }
    }

    throw new Error('Failed to create recipe')
  } catch (error) {
    console.error('[CREATE_RECIPE_ERROR]', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create recipe'
    }
  }
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized: You must be logged in to update a recipe')
    }

    // Delete existing sections and items
    await prisma.$transaction([
      prisma.recipeItem.deleteMany({
        where: {
          section: {
            recipeId: id
          }
        }
      }),
      prisma.recipeSection.deleteMany({
        where: {
          recipeId: id
        }
      })
    ])

    // Update recipe with new data
    const recipe = await prisma.recipe.update({
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
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      }
    })

    revalidatePath('/dashboard/recipes')
    return { success: true, recipe }
  } catch (error) {
    console.error('[UPDATE_RECIPE_ERROR]', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update recipe'
    }
  }
}

export async function deleteRecipe(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized: You must be logged in to delete a recipe')
    }

    await prisma.recipe.delete({
      where: { 
        id,
        userId: session.user.id
      }
    })
    
    revalidatePath('/dashboard/recipes')
    return { success: true }
  } catch (error) {
    console.error('[DELETE_RECIPE_ERROR]', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete recipe'
    }
  }
} 