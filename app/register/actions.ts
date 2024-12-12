"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { RegisterSchema } from "@/lib/validations/auth"

type RegisterResult = {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
}

export async function registerAction(
  input: z.infer<typeof RegisterSchema>
): Promise<RegisterResult> {
  try {
    // 1. Validate input
    const result = RegisterSchema.safeParse(input)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".")
        fieldErrors[path] = issue.message
      })
      return { success: false, fieldErrors }
    }

    // 2. Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (existingUser) {
      return {
        success: false,
        fieldErrors: {
          email: "This email is already registered",
        },
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10)

    // 4. Create user
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
} 