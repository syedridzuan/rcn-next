"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "path";

const FormSchema = z.object({
  id: z.string().nonempty("Category ID is required"),
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

export async function updateCategory(formData: FormData) {
  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;

  const parsed = FormSchema.safeParse({ id, name, description });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  // Fetch existing category
  const existingCategory = await prisma.category.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existingCategory) {
    throw new Error("Category not found.");
  }

  const slug = slugify(parsed.data.name);
  // If name changed and slug differs, check duplicates
  if (slug !== existingCategory.slug) {
    const checkSlug = await prisma.category.findUnique({ where: { slug } });
    if (checkSlug) {
      throw new Error("A category with this name already exists.");
    }
  }

  let imageUrl = existingCategory.image;
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${slug}-${timestamp}.${fileExtension}`;

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

  await prisma.category.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      image: imageUrl,
    },
  });

  // No error, category updated successfully
}
