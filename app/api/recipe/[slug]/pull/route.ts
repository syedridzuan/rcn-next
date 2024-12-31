// file: app/api/recipe/[slug]/pull/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildRecipeText } from "@/lib/buildRecipeText";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Find the recipe by slug.
    //    Include related data so buildRecipeText can build a more comprehensive text.
    const recipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        sections: {
          include: {
            items: true,
          },
        },
        tips: true,
        tags: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // 2. Build the text representation
    const recipeText = buildRecipeText(recipe);

    // 3. Return as JSON
    //    (the client or your other code can parse out `recipeText` for ChatGPT, etc.)
    return NextResponse.json({
      success: true,
      slug: params.slug,
      recipeText,
    });
  } catch (error: any) {
    console.error("Error pulling recipe text:", error);
    return NextResponse.json(
      { error: "Failed to pull recipe text" },
      { status: 500 }
    );
  }
}
