import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: { recipeId: string; imageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction([
      // Reset all images to non-primary
      prisma.recipeImage.updateMany({
        where: { recipeId: params.recipeId },
        data: { isPrimary: false },
      }),
      // Set the selected image as primary
      prisma.recipeImage.update({
        where: {
          id: params.imageId,
          recipeId: params.recipeId,
        },
        data: { isPrimary: true },
      }),
    ]);

    revalidatePath(`/admin/recipes/${params.recipeId}/images`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set primary image:", error);
    return NextResponse.json(
      { error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}
