import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    // Await params before using them
    const resolvedParams = await Promise.resolve(params)
    const commentId = resolvedParams.commentId

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      )
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this comment" },
        { status: 403 }
      )
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COMMENT_DELETE]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 