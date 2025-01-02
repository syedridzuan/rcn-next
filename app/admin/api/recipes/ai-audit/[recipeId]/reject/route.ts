// app/admin/api/recipes/ai-audit/[recipeId]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { recipeId } = params;

    // Possibly just clear out the AI fields without updating real fields:
    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        openaiPrepTime: null,
        openaiCookTime: null,
        openaiTotalTime: null,
        openaiDifficulty: null,
        openaiTags: null,
        openaiServingType: null,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Error rejecting AI suggestions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
