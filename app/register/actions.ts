"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { RegisterSchema } from "@/lib/validations/auth"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import crypto from "crypto"

type RegisterResult = {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
}

const ses = new SESClient({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

    // 4. Create user (unverified)
    const newUser = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
    })

    // 5. Create a verification token
    const tokenValue = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry

    await prisma.verificationToken.create({
      data: {
        identifier: newUser.email,
        token: tokenValue,
        expires,
      },
    })

    // 6. Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${encodeURIComponent(tokenValue)}`

    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [newUser.email],
      },
      Message: {
        Subject: {
          Data: "Sila Sahkan Akaun Anda",
        },
        Body: {
          Html: {
            Data: `
              <h1>Sahkan Akaun Anda</h1>
              <p>Sila klik pautan di bawah untuk mengesahkan akaun anda:</p>
              <a href="${verificationUrl}">Sahkan Akaun</a>
              <p>Jika anda tidak meminta ini, abaikan sahaja emel ini.</p>
            `,
          },
        },
      },
    });

    try {
      await ses.send(command);
    } catch (error) {
      console.error('Failed to send verification email:', error)
      return { success: false, message: 'Failed to send verification email' }
    }

    return { success: true }
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}