'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateSavedRecipeNotes(savedRecipeId: string, notes: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Update the note, ensuring the saved recipe belongs to the user
    await prisma.savedRecipe.update({
      where: {
        id: savedRecipeId,
        userId: session.user.id, // Ensure user owns this saved recipe
      },
      data: {
        notes: notes.trim() || null,
      },
    })

    revalidatePath('/account/saved')
    return { success: true }
  } catch (error) {
    console.error('Failed to update note:', error)
    throw new Error('Failed to update note')
  }
}

export async function unsaveRecipe(savedRecipeId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Delete the saved recipe, ensuring it belongs to the user
    await prisma.savedRecipe.delete({
      where: {
        id: savedRecipeId,
        userId: session.user.id, // Ensure user owns this saved recipe
      },
    })

    revalidatePath('/account/saved')
    return { success: true }
  } catch (error) {
    console.error('Failed to unsave recipe:', error)
    throw new Error('Failed to unsave recipe')
  }
} 