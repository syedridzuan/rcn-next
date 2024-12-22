"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { RegisterSchema } from "@/lib/validations/auth"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import crypto from "crypto"

export async function registerAction(input: z.infer<typeof RegisterSchema>) {
  // 1. Validate input
  const result = RegisterSchema.safeParse(input)
  if (!result.success) {
    // Build fieldErrors from zod issues
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message
    })
    return { success: false, fieldErrors }
  }

  // 2. Check if email or username is already registered
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.email },
        { username: input.username },
      ],
    },
    select: { id: true },
  })
  if (existingUser) {
    return {
      success: false,
      fieldErrors: {
        username: "That username or email is taken.",
      },
    }
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10)

  // 4. Create user
  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      status: "ACTIVE", 
      role: "USER", 
    },
  })

  // 5. Create verification token
  const tokenValue = crypto.randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  await prisma.verificationToken.create({
    data: {
      identifier: newUser.email!,
      token: tokenValue,
      expires,
    },
  })

  // 6. Send verification email
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${encodeURIComponent(tokenValue)}`

  // Use your AWS SES region
  const ses = new SESClient({
    region: process.env.AWS_SES_REGION_NAME!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    // Optional: if you want a custom endpoint:
    endpoint: `https://${process.env.AWS_SES_REGION_ENDPOINT}`,
  })

  try {
    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [newUser.email!],
      },
      Message: {
        Subject: { Data: "Verify Your Account" },
        Body: {
          Html: {
            Data: `
              <h1>Verify Your Account</h1>
              <p>Thanks for signing up, <strong>${newUser.username}</strong>! 
              Please click the link below to verify your account:</p>
              <p><a href="${verificationUrl}" target="_blank">Verify Now</a></p>
              <p>This link will expire in 24 hours.</p>
            `
          }
        }
      },
    })
    await ses.send(command)
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return {
      success: false,
      message: "Failed to send verification email",
    }
  }

  // Registration succeeded
  return { success: true }
}
