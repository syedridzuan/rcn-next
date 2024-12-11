'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveRecipe(recipeId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Create saved recipe entry
    await prisma.savedRecipe.create({
      data: {
        userId: session.user.id,
        recipeId: recipeId,
      },
    })

    revalidatePath('/resepi/[slug]')
    revalidatePath('/account/saved')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to save recipe:', error)
    throw new Error('Failed to save recipe')
  }
}

export async function unsaveRecipe(savedRecipeId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Delete saved recipe entry
    await prisma.savedRecipe.delete({
      where: {
        id: savedRecipeId,
        userId: session.user.id,
      },
    })

    revalidatePath('/resepi/[slug]')
    revalidatePath('/account/saved')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to unsave recipe:', error)
    throw new Error('Failed to unsave recipe')
  }
} 