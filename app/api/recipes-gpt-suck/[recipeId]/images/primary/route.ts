import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: { recipeId: string } }
) {
  const { recipeId } = context.params;
  const { imageId } = await request.json(); // Get the image ID from the request body

  try {
    // Validate recipe existence
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Reset all images' isPrimary for the recipe
    await prisma.recipeImage.updateMany({
      where: { recipeId },
      data: { isPrimary: false },
    });

    // Set the selected image as primary
    await prisma.recipeImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting primary image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}
