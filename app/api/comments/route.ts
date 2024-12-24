import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { CreateCommentSchema } from "@/types/comments";
import { createComment } from "@/services/comments";
// 1) Import your Akismet helper
import { checkCommentForSpam } from "@/lib/akismet";

export async function POST(req: Request) {
  try {
    // 2) Check authentication
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3) Rate limiting
    const { success, remaining } = await checkRateLimit(session.user.id);
    if (!success) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      });
    }

    // 4) Parse and validate request body
    const json = await req.json();
    const validatedFields = CreateCommentSchema.safeParse(json);
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validatedFields.error.errors,
        },
        { status: 400 }
      );
    }

    // 5) Extract comment fields
    const { content, recipeId, parentId } = validatedFields.data;

    // 6) Prepare data for Akismet
    // (e.g., ip, user agent, author name/email if known)
    const userIp = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";
    const commentAuthor = session.user.name || "Anonymous";
    const commentEmail = session.user.email || "";

    // 7) Run the Akismet check
    //    (You may need to change the parameter object shape
    //     to match your checkCommentForSpam signature.)
    const isSpam = await checkCommentForSpam({
      user_ip: userIp,
      user_agent: userAgent,
      comment_author: commentAuthor,
      comment_author_email: commentEmail,
      comment_content: content,
    });

    if (isSpam) {
      console.log("Comment flagged as spam:", content);
      // 8) Either reject entirely or store as “SPAM”
      //    (depending on your design)
      return NextResponse.json(
        {
          success: false,
          error: "Comment flagged as spam",
        },
        { status: 400 }
      );
    }

    // 9) Otherwise, create the comment
    const comment = await createComment({
      content,
      recipeId,
      userId: session.user.id,
      parentId: parentId || null,
      status: "APPROVED", // or "PENDING" if you want to moderate
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Server-side error:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

// ...the GET method remains unchanged or you can keep it simple.

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
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    // Add this debug log
    console.log("Fetching comments for recipe:", recipeId);

    // Check if user is admin for including all comments
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    const comments = await getRecipeComments(recipeId, isAdmin);

    // Add this debug log
    console.log("Found comments:", comments);

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
