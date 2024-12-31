import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { recipeId: string; imageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = await prisma.recipeImage.findUnique({
      where: {
        id: params.imageId,
        recipeId: params.recipeId,
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Vercel Blob
    if (image.url.startsWith("https://")) {
      await del(image.url);
    }

    // Delete from database
    await prisma.recipeImage.delete({
      where: {
        id: params.imageId,
      },
    });

    revalidatePath(`/admin/recipes/${params.recipeId}/images`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
