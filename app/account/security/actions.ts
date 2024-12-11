'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hash, verify } from "@/lib/auth/password"
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
})

export async function updateUserPassword(data: z.infer<typeof passwordSchema>) {
  try {
    // Validate input
    const validatedData = passwordSchema.parse(data)
    
    // Get current user
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Not authenticated")
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      throw new Error("No password set for this account")
    }

    // Verify current password
    const isValid = await verify(validatedData.currentPassword, user.password)
    if (!isValid) {
      throw new Error("Current password is incorrect")
    }

    // Hash new password
    const hashedPassword = await hash(validatedData.newPassword)

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update password:', error)
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update password')
  }
} 