'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

interface CategoryInput {
  name: string
  description?: string
}

export async function createCategory(input: CategoryInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!input.name) {
    return { success: false, message: "Name is required." }
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        description: input.description,
        slug: input.name.toLowerCase().replace(/\s+/g, '-'),
      }
    })
    
    revalidatePath('/dashboard/categories')
    return { success: true, id: category.id }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to create category." 
    }
  }
}

export async function updateCategory(id: string, input: CategoryInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!input.name) {
    return { success: false, message: "Name is required." }
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        slug: input.name.toLowerCase().replace(/\s+/g, '-'),
      }
    })
    
    revalidatePath('/dashboard/categories')
    return { success: true, id: category.id }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to update category." 
    }
  }
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" }
  }

  if (!id) {
    return { success: false, message: "Category ID is required." }
  }

  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to delete category." 
    }
  }
} 