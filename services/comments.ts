import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import type { CommentWithUser } from "@/types/comments"

export async function getComments(recipeId: string) {
  try {
    // Only fetch top-level comments (parentId is null) with their replies
    const comments = await prisma.comment.findMany({
      where: {
        recipeId,
        parentId: null, // Only get top-level comments
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // Include one level of replies
        replies: {
          where: {
            status: "APPROVED",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return comments as CommentWithUser[]
  } catch (error) {
    console.error("Error fetching comments:", error)
    throw new Error("Failed to fetch comments")
  }
}

export async function createComment(
  data: Prisma.CommentUncheckedCreateInput
) {
  try {
    // If parentId is provided, verify it's a valid top-level comment
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
      })

      if (!parentComment) {
        throw new Error("Parent comment not found")
      }

      if (parentComment.parentId) {
        throw new Error("Cannot reply to a reply")
      }
    }

    const comment = await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return comment as CommentWithUser
  } catch (error) {
    console.error("Error creating comment:", error)
    throw error
  }
} 