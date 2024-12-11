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
      throw new Error("Not authenticated")
    }

    // Get form data
    const name = formData.get('name') as string
    const imageFile = formData.get('image') as File

    // Prepare the data object for prisma update
    const updateData: any = {
      name: name || null,
    }

    // Handle image upload if a new file was provided
    if (imageFile && imageFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile')
      try {
        await writeFile(path.join(uploadDir, '.gitkeep'), '')
      } catch (error) {
        // Directory already exists, continue
      }

      // Generate unique filename
      const filename = generateUniqueFilename(imageFile.name)
      const filePath = path.join(uploadDir, filename)
      
      // Convert File object to Buffer and save it
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Write file to disk
      await writeFile(filePath, buffer)
      
      // Update the image path in the database
      updateData.image = `/uploads/profile/${filename}`
    }

    // Update user in database
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    // Revalidate the profile page
    revalidatePath('/account/profile')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
} 