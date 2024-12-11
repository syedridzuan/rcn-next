'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function unsaveRecipe(savedRecipeId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Delete the saved recipe entry
    await prisma.savedRecipe.delete({
      where: {
        id: savedRecipeId,
        AND: {
          userId: session.user.id, // Ensure the saved recipe belongs to the user
        },
      },
    })

    // Revalidate the saved recipes page
    revalidatePath('/account/saved')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to unsave recipe:', error)
    throw new Error('Failed to unsave recipe')
  }
} 