// app/api/recipes/[recipeId]/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILES = 10;

class UploadError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code: string = "UPLOAD_ERROR"
  ) {
    super(message);
    this.name = "UploadError";
  }
}

const validateRecipe = async (recipeId: string) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    throw new UploadError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }
  return recipe;
};

const validateFiles = (files: File[]) => {
  if (files.length === 0) {
    throw new UploadError("No files provided", 400, "NO_FILES");
  }

  if (files.length > MAX_FILES) {
    throw new UploadError(
      `Too many files. Maximum ${MAX_FILES} allowed`,
      400,
      "TOO_MANY_FILES"
    );
  }

  files.forEach((file, index) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new UploadError(
        `File ${
          index + 1
        } has invalid type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        400,
        "INVALID_FILE_TYPE"
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new UploadError(
        `File ${index + 1} is too large. Maximum size: ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`,
        400,
        "FILE_TOO_LARGE"
      );
    }
  });
};

export async function POST(
  request: NextRequest,
  context: { params: { recipeId: string } }
) {
  try {
    // Await `params` for dynamic route handling
    const params = await context.params;
    const recipeId = params.recipeId;

    // Step 1: Validate recipe existence
    await validateRecipe(recipeId);

    // Step 2: Get uploaded files and validate
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];
    validateFiles(files);

    // Step 3: Prepare upload directories
    const baseDir = join(
      process.cwd(),
      "public",
      "uploads",
      "recipes",
      recipeId
    );
    const dirs = ["original", "medium", "thumbnail"].map((dir) =>
      join(baseDir, dir)
    );

    await Promise.all(dirs.map((dir) => mkdir(dir, { recursive: true })));

    // Step 4: Process images and create database records
    const imageRecords = await Promise.all(
      files.map(async (file, index) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9.]/g,
          ""
        )}`;

        // Save original file
        const originalPath = join(dirs[0], filename);
        await writeFile(originalPath, buffer);

        // Process image sizes using sharp
        await sharp(buffer)
          .resize(800, 600, { fit: "inside", withoutEnlargement: true })
          .toFile(join(dirs[1], filename));

        await sharp(buffer)
          .resize(200, 200, { fit: "cover" })
          .toFile(join(dirs[2], filename));

        // Create database record
        return await prisma.recipeImage.create({
          data: {
            url: `/uploads/recipes/${recipeId}/original/${filename}`,
            mediumUrl: `/uploads/recipes/${recipeId}/medium/${filename}`,
            thumbnailUrl: `/uploads/recipes/${recipeId}/thumbnail/${filename}`,
            recipeId,
            isPrimary: index === 0 && files.length === 1,
          },
        });
      })
    );

    return NextResponse.json({ success: true, images: imageRecords });
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof UploadError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
