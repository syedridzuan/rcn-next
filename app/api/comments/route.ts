import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { CommentSchema } from "@/types/comments"
import { createComment, getRecipeComments, CommentError } from "@/services/comments"
import { getRateLimitMiddleware } from "@/lib/rate-limit"

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
    // 1. Authentication check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Rate limiting
    const rateLimit = await getRateLimitMiddleware("comments")
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        }
      )
    }

    // 3. Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid JSON in request body" 
        },
        { status: 400 }
      )
    }

    // 4. Validate against schema
    const result = CommentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.errors.map(err => ({
            path: err.path,
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    // 5. Create comment (spam check happens inside createComment)
    const isAdmin = session.user.role === "ADMIN"
    const { comment, isPending, reason } = await createComment(
      session.user.id, 
      result.data,
      isAdmin
    )
    
    return NextResponse.json({ 
      success: true, 
      data: comment,
      isPending,
      message: isPending 
        ? "Your comment is under review and will be visible once approved" 
        : undefined,
      reason: isPending ? reason : undefined
    })
  } catch (error) {
    console.error("[COMMENTS_POST]", error)
    
    if (error instanceof CommentError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
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