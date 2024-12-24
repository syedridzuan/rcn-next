// File: app/api/moderation/comments/bulk/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // 1. Check authentication/role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // 2. Parse JSON body
    const { commentIds, action } = await req.json();
    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No comment IDs provided" },
        { status: 400 }
      );
    }

    // 3. Execute the bulk operation
    if (action === "delete") {
      // Bulk delete
      await prisma.comment.deleteMany({
        where: { id: { in: commentIds } },
      });
    } else {
      // Bulk update status
      let newStatus: CommentStatus;
      switch (action) {
        case "approve":
          newStatus = CommentStatus.APPROVED;
          break;
        case "reject":
          newStatus = CommentStatus.REJECTED;
          break;
        case "spam":
          newStatus = CommentStatus.SPAM;
          break;
        default:
          newStatus = CommentStatus.PENDING;
      }

      await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
