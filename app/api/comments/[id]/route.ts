import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!params.id) {
      return new NextResponse(
        JSON.stringify({ error: "Comment ID is required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!comment) {
      return new NextResponse(
        JSON.stringify({ error: "Comment not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (comment.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "You are not authorized to delete this comment" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await prisma.comment.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE_COMMENT]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 