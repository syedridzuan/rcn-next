"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "path";

const FormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
});

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
}

export async function addCategory(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;

  const parsed = FormSchema.safeParse({ name, description });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  // Generate slug from name
  const slug = slugify(parsed.data.name);

  // Check for duplicates
  const existing = await prisma.category.findUnique({
    where: { slug: slug },
  });

  if (existing) {
    throw new Error("A category with this name already exists.");
  }

  // Handle file upload as before
  const file = formData.get("imageFile") as File | null;
  let imageUrl = null;

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${slug}-${timestamp}.${fileExtension}`;

    // Ensure directories exist: public/uploads/categories
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "categories",
      fileName
    );
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    imageUrl = `/uploads/categories/${fileName}`;
  }

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: slug,
      description: parsed.data.description,
      image: imageUrl,
    },
  });

  // No error, category created successfully
}
