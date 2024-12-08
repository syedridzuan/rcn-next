import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (
  req: Request,
  { params }: { params: { recipeId: string } }
) => {
  const { recipeId } = params;

  try {
    // Fetch all images for the given recipe ID
    const images = await prisma.recipeImage.findMany({
      where: { recipeId },
      orderBy: { createdAt: "asc" }, // Sort by creation date
    });

    if (!images.length) {
      return NextResponse.json(
        { error: "No images found for the specified recipe." },
        { status: 404 }
      );
    }

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("Error fetching recipe images:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: Request,
  { params }: { params: { recipeId: string } }
) => {
  const { recipeId } = params;

  // Check if the recipe exists
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const cuid = (await import("cuid")).default();
    const recipeDir = path.join(
      process.cwd(),
      "public/images/recipes",
      recipeId
    );

    // Ensure the directory exists
    if (!fs.existsSync(recipeDir)) {
      fs.mkdirSync(recipeDir, { recursive: true });
    }

    // File paths
    const originalPath = path.join(recipeDir, `${cuid}-original.jpg`);
    const thumbnailPath = path.join(recipeDir, `${cuid}-thumbnail.jpg`);
    const mediumPath = path.join(recipeDir, `${cuid}-medium.jpg`);

    // Save original image
    fs.writeFileSync(originalPath, buffer);

    // Generate thumbnail and medium images
    await sharp(buffer).resize(150, 150).toFile(thumbnailPath);
    await sharp(buffer).resize(600, 400).toFile(mediumPath);

    // Save to database
    const newImage = await prisma.recipeImage.create({
      data: {
        recipeId,
        url: `/images/recipes/${recipeId}/${cuid}-original.jpg`,
        thumbnailUrl: `/images/recipes/${recipeId}/${cuid}-thumbnail.jpg`,
        mediumUrl: `/images/recipes/${recipeId}/${cuid}-medium.jpg`,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
