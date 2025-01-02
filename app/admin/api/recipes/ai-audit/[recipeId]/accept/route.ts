// app/admin/api/recipes/ai-audit/[recipeId]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// Async param destructuring fix
export async function POST(
  req: NextRequest,
  { params: promisedParams }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const { recipeId } = await promisedParams;

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: {
        id: true,
        prepTime: true,
        cookTime: true,
        totalTime: true,
        difficulty: true,
        tags: true, // <-- existing tags
        openaiPrepTime: true,
        openaiCookTime: true,
        openaiTotalTime: true,
        openaiDifficulty: true,
        openaiTags: true, // JSON
        openaiServingType: true,
      },
    });
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Convert openaiTags from JSON -> connectOrCreate if it's an array
    let connectOrCreate = undefined;
    if (Array.isArray(recipe.openaiTags)) {
      const aiTagsSlugs = recipe.openaiTags.map((tag) =>
        tag.toString().trim().toLowerCase().replace(/\s+/g, "-")
      );
      connectOrCreate = aiTagsSlugs.map((slug) => ({
        where: { slug },
        create: {
          name: slug.replace(/-/g, " "),
          slug,
        },
      }));
    }

    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        prepTime: recipe.openaiPrepTime ?? recipe.prepTime,
        cookTime: recipe.openaiCookTime ?? recipe.cookTime,
        totalTime: recipe.openaiTotalTime ?? recipe.totalTime,
        difficulty: recipe.openaiDifficulty ?? recipe.difficulty,
        // For real relational tags: if we only want to "append," do:
        // tags: { connectOrCreate },
        // Or if you want to REPLACE existing tags with the new set, do something like:
        tags: {
          deleteMany: {}, // remove old
          connectOrCreate: connectOrCreate ?? [],
        },

        // Clear out the AI columns
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
    console.error("Error accepting AI suggestions:", error);
    // Always ensure you return a valid JSON object
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
