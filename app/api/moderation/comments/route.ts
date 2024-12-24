import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CommentStatus } from "@prisma/client"; // For the enum type

// GET /api/moderation/comments?status=ALL|PENDING|APPROVED|REJECTED|SPAM
export async function GET(req: Request) {
  try {
    // 1. Check if user is Admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Extract query params
    const { searchParams } = new URL(req.url);
    const statusQuery = searchParams.get("status") ?? "ALL";

    // 3. Build Prisma where condition
    let whereClause = {};
    if (statusQuery !== "ALL") {
      // Validate it matches our enum keys or fallback
      if (!Object.keys(CommentStatus).includes(statusQuery)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status: ${statusQuery}`,
          },
          { status: 400 }
        );
      }
      whereClause = { status: statusQuery };
    }

    // 4. Fetch comments
    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        recipe: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("[MODERATION_COMMENTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/moderation/comments?commentId={someId}
export async function DELETE(req: Request) {
  try {
    // 1. Check if user is Admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Parse the query param
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing commentId query parameter",
        },
        { status: 400 }
      );
    }

    // 3. Try deleting the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      success: true,
      message: "Comment successfully deleted",
    });
  } catch (error) {
    console.error("[MODERATION_COMMENTS_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
