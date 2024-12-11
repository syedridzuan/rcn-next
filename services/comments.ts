import { PrismaClient } from "@prisma/client"
import { CommentInput, COMMENT_STATUS, Comment } from "@/types/comments"
import { prisma } from "@/lib/db"

export class CommentError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
    this.name = "CommentError"
  }
}

/**
 * Creates a new comment for a recipe
 * @param userId - The ID of the user creating the comment
 * @param data - The comment data (content and recipeId)
 * @param isAdmin - Whether the user is an admin (for status override)
 * @returns The created comment
 */
export async function createComment(
  userId: string, 
  data: CommentInput,
  isAdmin: boolean = false
): Promise<Comment> {
  // Check if recipe exists
  const recipe = await prisma.recipe.findUnique({
    where: { id: data.recipeId },
  })

  if (!recipe) {
    throw new CommentError("Recipe not found", 404)
  }

  // Create comment with transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    // Check user's recent comments to prevent spam
    const recentComments = await tx.comment.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
    })

    if (recentComments >= 5) {
      throw new CommentError("Too many comments in a short time")
    }

    // Determine comment status based on configuration and user role
    const status = isAdmin 
      ? COMMENT_STATUS.APPROVED
      : process.env.COMMENTS_REQUIRE_APPROVAL === "true" 
        ? COMMENT_STATUS.PENDING 
        : COMMENT_STATUS.APPROVED

    return tx.comment.create({
      data: {
        content: data.content,
        recipeId: data.recipeId,
        userId,
        status,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    }) as Promise<Comment>
  })
}

/**
 * Retrieves comments for a recipe
 * @param recipeId - The ID of the recipe
 * @param includeAll - Whether to include non-approved comments (admin only)
 * @returns Array of comments
 */
export async function getRecipeComments(
  recipeId: string, 
  includeAll: boolean = false
): Promise<Comment[]> {
  return await prisma.comment.findMany({
    where: {
      recipeId,
      // Only show approved comments unless specifically requesting all
      status: includeAll ? undefined : COMMENT_STATUS.APPROVED,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<Comment[]>
} 