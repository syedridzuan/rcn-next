'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

interface TagInput {
  name: string
}

export async function createTagAction(input: TagInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!input.name) {
    return { success: false, message: "Name is required." }
  }

  try {
    const tag = await prisma.tag.create({ 
      data: { name: input.name } 
    })
    
    revalidatePath('/dashboard/tags')
    return { success: true, id: tag.id }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to create tag." 
    }
  }
}

export async function updateTagAction(id: string, input: TagInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!input.name) {
    return { success: false, message: "Name is required." }
  }

  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: { name: input.name }
    })
    
    revalidatePath('/dashboard/tags')
    return { success: true, id: tag.id }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to update tag." 
    }
  }
}

export async function deleteTagAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!id) {
    return { success: false, message: "Tag ID is required." }
  }

  try {
    await prisma.tag.delete({ where: { id } })
    revalidatePath('/dashboard/tags')
    return { success: true }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to delete tag." 
    }
  }
}
