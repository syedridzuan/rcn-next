import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { CreateCommentSchema } from "@/types/comments"
import { createComment } from "@/services/comments"

/**
 * POST /api/comments
 * Creates a new comment for a recipe
 * 
 * @body {
 *   content: string - Comment content (1-1000 chars)
 *   recipeId: string - UUID of the recipe
 * }
 * 
 * @returns {
 *   success: boolean
 *   data?: Comment
 *   error?: string
 * }
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Rate limiting
    const { success, remaining } = await checkRateLimit(session.user.id)
    if (!success) {
      return new NextResponse("Too many requests", { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        }
      })
    }

    const json = await req.json()
    const validatedFields = CreateCommentSchema.safeParse(json)

    if (!validatedFields.success) {
      return new NextResponse("Invalid input", { status: 400 })
    }

    const { content, recipeId, parentId } = validatedFields.data

    const comment = await createComment({
      content,
      recipeId,
      userId: session.user.id,
      parentId: parentId || null,
      status: "PENDING", // Or "APPROVED" depending on your moderation strategy
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[COMMENTS_POST]", error)
    if (error instanceof Error) {
      if (error.message === "Cannot reply to a reply") {
        return new NextResponse(error.message, { status: 400 })
      }
      if (error.message === "Parent comment not found") {
        return new NextResponse(error.message, { status: 404 })
      }
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * GET /api/comments?recipeId={uuid}
 * Retrieves comments for a recipe
 * 
 * @query recipeId - UUID of the recipe
 * 
 * @returns {
 *   success: boolean
 *   data?: Comment[]
 *   error?: string
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const recipeId = searchParams.get("recipeId")

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      )
    }

    // Check if user is admin for including all comments
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"
    
    const comments = await getRecipeComments(recipeId, isAdmin)
    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error("[COMMENTS_GET]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 