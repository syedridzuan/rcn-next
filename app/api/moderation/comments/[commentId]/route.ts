import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CommentStatus } from "@prisma/client";

// Simple Zod schema to validate the status body
const UpdateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
});

// PATCH (or POST) /api/moderation/comments/[commentId]
export async function PATCH(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    // 1. Check if user is Admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Validate the commentId param
    const { commentId } = params;
    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing commentId in URL",
        },
        { status: 400 }
      );
    }

    // 3. Parse the request body to get new status
    const json = await req.json();
    const parsed = UpdateCommentStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status provided",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    // 4. Update the comment
    const { status } = parsed.data;
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        recipe: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[MODERATION_COMMENTS_UPDATE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    await prisma.comment.delete({
      where: { id: params.commentId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE comment error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
