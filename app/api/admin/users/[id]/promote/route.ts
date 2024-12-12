import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user ID from params
    const userId = params.id

    // Don't allow promoting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot modify your own role" },
        { status: 400 }
      )
    }

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USER_PROMOTE]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 