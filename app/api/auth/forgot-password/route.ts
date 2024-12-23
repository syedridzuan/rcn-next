import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendResetPasswordEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 })
    }

    // 2. Create random token
    const tokenValue = crypto.randomUUID()
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour expiry

    // 3. Save token in DB (e.g. reuse verificationToken)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenValue,
        expires,
      },
    })

    // 4. Automatically build domain from request
    const url = new URL(request.url)
    // This is typically "http://localhost:3000" in dev or "https://www.resepichenom.com" in prod
    const baseUrl = `${url.protocol}//${url.host}`

    // 5. Construct dynamic reset link
    const resetLink = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(tokenValue)}`

    // 6. Send email (SES or nodemailer) with the link
    await sendResetPasswordEmail(email, resetLink)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}