"use server";

import { prisma } from "@/lib/db";
import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";

// Directory where we'll store uploaded guide images
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "guides");

export async function uploadImageAction(formData: FormData) {
  const guideId = formData.get("guideId")?.toString();
  const file = formData.get("imageFile") as File | null;
  const alt = formData.get("alt")?.toString().trim() || null;

  if (!guideId || !file || file.size === 0) {
    throw new Error("Missing guideId or image file");
  }

  // Check if guide exists
  const guide = await prisma.guide.findUnique({ where: { id: guideId } });
  if (!guide) {
    throw new Error("Guide not found");
  }

  // Ensure public/uploads/guides/ directory exists
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Error ensuring guides directory:", err);
    throw new Error("Failed to prepare upload directory");
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate a unique file name
  const ext = path.extname(file.name) || ".jpg";
  const timestamp = Date.now();
  const fileName = `guide-${guideId}-${timestamp}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Write file to local filesystem
  try {
    await fs.writeFile(filePath, buffer);
  } catch (err) {
    console.error("Error writing file:", err);
    throw new Error("Failed to save image");
  }

  // Construct a URL that can be accessed publicly
  const imageUrl = `/uploads/guides/${fileName}`;

  // Create GuideImage record in the database
  await prisma.guideImage.create({
    data: {
      url: imageUrl,
      alt,
      guideId,
    },
  });

  // If needed, you can revalidate the page to show the new image:
  // revalidatePath(`/admin/guides/${guideId}/images`);
  // redirect(`/admin/guides/${guideId}/images`);
}

export async function deleteImageAction(formData: FormData) {
  const imageId = formData.get("imageId")?.toString();
  const guideId = formData.get("guideId")?.toString(); // Make sure you're passing guideId as well

  if (!imageId || !guideId) {
    throw new Error("Missing imageId or guideId");
  }

  // Delete the image record
  await prisma.guideImage.delete({
    where: { id: imageId },
  });

  // Use the actual guideId in the path
  revalidatePath(`/admin/guides/${guideId}/images`);
}
