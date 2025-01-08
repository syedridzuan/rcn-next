// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { CreateCommentSchema } from "@/types/comments";
import { createComment } from "@/services/comments";
import { sendEmail } from "@/lib/email"; // Your SES or other email logic
import { CommentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    console.log("[COMMENTS API] POST /api/comments - START");

    // 1) Check auth
    const session = await auth();
    console.log("[COMMENTS API] Auth check:", {
      authenticated: !!session?.user,
    });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2) Re-check DB for user status
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    });
    if (dbUser?.status === "SUSPENDED") {
      return new NextResponse("Forbidden: Account suspended", { status: 403 });
    }

    // 2) Rate-limiting
    const { success, remaining } = await checkRateLimit(session.user.id);
    console.log("[COMMENTS API] Rate limit:", { success, remaining });
    if (!success) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      });
    }

    // 3) Parse request body
    const json = await req.json();
    console.log("[COMMENTS API] Incoming request body:", json);

    // 4) Validate data with Zod
    const validatedFields = CreateCommentSchema.safeParse(json);
    if (!validatedFields.success) {
      console.log(
        "[COMMENTS API] Zod validation errors:",
        validatedFields.error.errors
      );
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.errors },
        { status: 400 }
      );
    }

    const { content, recipeId, parentId } = validatedFields.data;

    // 5) Actually create the comment in your DB
    const newComment = await createComment({
      content,
      recipeId,
      userId: session.user.id,
      parentId: parentId || null,
      status: "APPROVED", // or 'PENDING' if you want moderation
    });
    console.log("[COMMENTS API] Created comment:", newComment.id);

    // 6) If it’s a reply, notify the parent comment’s author (if subscribed)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              subscribeCommentReply: true,
            },
          },
        },
      });

      // Make sure parent comment & user exist
      if (parentComment?.user) {
        const parentUser = parentComment.user;
        // 6.1) Make sure user is not replying to themselves OR you might allow it
        // 6.2) Check if parent user has subscribeCommentReply == true
        if (
          parentUser.id !== session.user.id &&
          parentUser.subscribeCommentReply
        ) {
          console.log(
            `[COMMENTS API] Sending comment-reply notification to ${parentUser.email}`
          );

          // Compose your message
          // Possibly include the original comment content, the reply content, etc.
          const subject = "Someone replied to your comment";
          const body = `
            <h1>Komen Anda Menerima Balasan</h1>
            <p>Hi ${parentUser.name || "Pengguna"},</p>
            <p>
              Komen anda telah dibalas. Kandungan balasan:
            </p>
            <blockquote>${content}</blockquote>
            <p>
              Layari pautan ini untuk membaca keseluruhan thread.
            </p>
            <p>Terima kasih!</p>
          `;

          // 6.3) Send the email (adjust `sendEmail` signature as needed)
          await sendEmail({
            to: parentUser.email!,
            subject,
            html: body,
          });
        }
      }
    }

    // 7) Return success
    return NextResponse.json(newComment);
  } catch (error) {
    console.error("[COMMENTS API] Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

// GET /api/comments?recipeId={uuid}
// Returns up to 2 levels deep of nested replies for each top-level comment
export async function GET(req: Request) {
  try {
    // Optional: Check if user is authenticated
    // const session = await auth()
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, error: "Unauthorized" },
    //     { status: 401 }
    //   )
    // }

    // 1) Parse query params
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");
    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "Missing recipeId" },
        { status: 400 }
      );
    }

    // 2) Fetch top-level comments (parentId = null), with status = APPROVED (if you only want approved)
    //    and include user + up to two levels of replies
    const topLevelComments = await prisma.comment.findMany({
      where: {
        recipeId,
        parentId: null,
        status: CommentStatus.APPROVED,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // One level of replies
        replies: {
          where: {
            status: CommentStatus.APPROVED, // or remove to show all
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            // Second level of replies
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
                // If you need a third level, you can nest again (be mindful of performance)
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: topLevelComments,
    });
  } catch (error) {
    console.error("[COMMENTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
