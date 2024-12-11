import { PrismaClient } from "@prisma/client"
import { CommentInput, COMMENT_STATUS, Comment } from "@/types/comments"
import { checkSpamWithReason } from "@/lib/spam-detection"
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
 * @param isAdmin - Whether the user is an admin (bypass spam check)
 * @returns The created comment with spam check results
 */
export async function createComment(
  userId: string, 
  data: CommentInput,
  isAdmin: boolean = false
): Promise<{ comment: Comment; isPending: boolean; reason?: string }> {
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

    if (recentComments >= 3) {
      throw new CommentError("Too many comments. Please wait a moment.", 429)
    }

    // Perform spam check (skip for admins)
    const spamCheck = !isAdmin ? checkSpamWithReason(data.content) : { isSpam: false }
    
    // Log spam details for monitoring
    if (spamCheck.details) {
      console.log("[SPAM_CHECK]", {
        userId,
        recipeId: data.recipeId,
        content: data.content,
        ...spamCheck.details,
      })
    }

    const status = spamCheck.isSpam 
      ? COMMENT_STATUS.PENDING 
      : COMMENT_STATUS.APPROVED

    const comment = await tx.comment.create({
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
    })

    // Transform the comment to match our Comment type
    const transformedComment: Comment = {
      id: comment.id,
      content: comment.content,
      status: comment.status as CommentStatus,
      userId: comment.userId,
      recipeId: comment.recipeId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
    }

    return {
      comment: transformedComment,
      isPending: status === COMMENT_STATUS.PENDING,
      reason: spamCheck.reason
    }
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
  const comments = await prisma.comment.findMany({
    where: {
      recipeId,
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
  })

  // Transform the comments to match our Comment type
  return comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    status: comment.status as CommentStatus,
    userId: comment.userId,
    recipeId: comment.recipeId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
  }))
} 