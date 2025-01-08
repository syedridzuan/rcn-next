"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(8).toString("hex");
  return `${hash}${ext}`;
}

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // read fields
    const name = formData.get("name") as string;
    const instagramHandle = formData.get("instagramHandle") as string;
    const facebookHandle = formData.get("facebookHandle") as string;
    const tiktokHandle = formData.get("tiktokHandle") as string;
    const youtubeHandle = formData.get("youtubeHandle") as string;
    const blogUrl = formData.get("blogUrl") as string;

    const username = formData.get("username") as string;
    const sex = formData.get("sex") as string; // "MALE", "FEMALE", or empty
    const birthdateStr = formData.get("birthdate") as string;
    let birthdate: Date | null = null;
    if (birthdateStr) {
      const parsed = new Date(birthdateStr);
      if (!isNaN(parsed.getTime())) {
        birthdate = parsed;
      }
    }

    const updateData: any = {
      name: name || null,
      instagramHandle: instagramHandle || null,
      facebookHandle: facebookHandle || null,
      tiktokHandle: tiktokHandle || null,
      youtubeHandle: youtubeHandle || null,
      blogUrl: blogUrl || null,
      username: username || null,
      sex: sex || null,
      birthdate: birthdate || null,
    };

    // Handle image upload
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "profile"
        );
        await writeFile(path.join(uploadDir, ".gitkeep"), "");

        const filename = generateUniqueFilename(imageFile.name);
        const filePath = path.join(uploadDir, filename);

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        updateData.image = `/uploads/profile/${filename}`;
      } catch (error) {
        console.error("Failed to save image:", error);
        return { success: false, error: "Failed to save image" };
      }
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    revalidatePath("/account/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
