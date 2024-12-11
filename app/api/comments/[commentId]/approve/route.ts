import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { COMMENT_STATUS } from "@/types/comments"

export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
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

    // Get comment ID from params
    const commentId = params.commentId

    // Update comment status
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: COMMENT_STATUS.APPROVED },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COMMENT_APPROVE]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 