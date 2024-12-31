// file: app/api/recipe/[slug]/parse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseRecipeWithChatGPT } from "@/lib/parseRecipeWithChatGPT"; // Path to your script
import { buildRecipeText } from "@/lib/buildRecipeText"; // or inline the logic

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Get the recipe from DB
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

    // 2. Build a text representation (like in your existing /pull route)
    const recipeText = buildRecipeText(recipe);

    // 3. Call your ChatGPT parser
    const parsedResult = await parseRecipeWithChatGPT(recipeText);

    // 4. (Optional) Persist the extracted data
    //    For example: update the recipe with new times, difficulty, servings, etc.
    //    Only do this if you trust ChatGPT’s result enough to overwrite your DB.
    /*
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        prepTime: parsedResult.prepTime,
        cookTime: parsedResult.cookTime,
        // difficulty: parsedResult.difficulty,  // if you have an enum,
        servings: parsedResult.servings,
        // tags => might be tricky, you need to transform them and create the Tag if new
      },
    });
    */

    // 5. Return the structured result to the client
    return NextResponse.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error("Error parsing recipe with ChatGPT:", error);
    return NextResponse.json(
      { error: "Failed to parse recipe" },
      { status: 500 }
    );
  }
}
