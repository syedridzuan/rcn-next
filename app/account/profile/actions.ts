'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"

// Helper function to generate a unique filename
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const hash = crypto.randomBytes(8).toString('hex')
  return `${hash}${ext}`
}

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" }
    }

    // Get form data
    const name = formData.get('name') as string
    const imageFile = formData.get('image') as File

    const updateData: any = {
      name: name || null,
    }

    if (imageFile && imageFile.size > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile')
        await writeFile(path.join(uploadDir, '.gitkeep'), '')
        
        const filename = generateUniqueFilename(imageFile.name)
        const filePath = path.join(uploadDir, filename)
        
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        await writeFile(filePath, buffer)
        
        updateData.image = `/uploads/profile/${filename}`
      } catch (error) {
        console.error('Failed to save image:', error)
        return { success: false, error: 'Failed to save image' }
      }
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    revalidatePath('/account/profile')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
} 