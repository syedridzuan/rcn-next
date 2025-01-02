// app/admin/api/recipes-meta/[recipeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { RecipeDifficulty, RecipeStatus, ServingType } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  // Confirm admin:
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipeId = params.recipeId;

  try {
    const body = await request.json();

    // Validate fields. For example:
    const cookTime = Number(body.cookTime ?? 0);
    const prepTime = Number(body.prepTime ?? 0);
    const totalTime = body.totalTime != null ? Number(body.totalTime) : null;
    const servings = Number(body.servings ?? 1);
    const servingType: ServingType | null = body.servingType || null;
    const difficulty: RecipeDifficulty = body.difficulty || "EASY";
    const status: RecipeStatus = body.status || "DRAFT";

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        cookTime,
        prepTime,
        totalTime,
        servings,
        servingType,
        difficulty,
        status,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Failed to update recipe meta:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
