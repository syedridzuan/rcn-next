import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// This route expects something like /api/auth/verify?token=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  // Fetch the verification token from the database
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  // Check if the token exists and is not expired
  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  // Token found and valid, now link it to a user
  // Usually, identifier is the user's email
  const userEmail = verificationToken.identifier
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    // No user found matching the token’s identifier
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Update user as verified
  await prisma.user.update({
    where: { email: userEmail },
    data: {
      emailVerified: new Date(),
    },
  })

  // Delete the used verification token
  await prisma.verificationToken.delete({
    where: { token },
  })

  return NextResponse.json({ success: true })
}