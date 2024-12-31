"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function addGuideAction(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim() || null;

  const rawContent = formData.get("content");
  console.log("Raw content:", JSON.stringify(rawContent));

  const content2 = rawContent?.toString().trim() || null;
  console.log("Trimmed content:", JSON.stringify(content2));

  if (!title) {
    throw new Error("Title is required");
  }

  const slug = generateSlug(title);

  const guide = await prisma.guide.create({
    data: { title, slug, content },
  });

  revalidatePath("/admin/guides");
  //redirect(`/admin/guides/${guide.id}/edit`);
  return guide.id;
}
