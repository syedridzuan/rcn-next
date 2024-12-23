// pages/api/auth/reset-password.ts OR /app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    // Check token in VerificationToken table
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    })
    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "Token tidak sah atau telah luput." }, { status: 400 })
    }

    // Update user’s password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: {
        password: hashedPassword,
      },
    })

    // Delete or mark used token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}