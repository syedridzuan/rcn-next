"use server";

import { prisma } from "@/lib/db";

export async function addSectionAction(formData: FormData) {
  const guideId = formData.get("guideId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!guideId || !title || !content) {
    throw new Error("All fields are required");
  }

  await prisma.guideSection.create({
    data: {
      title,
      content,
      guideId,
    },
  });

  // Optionally revalidate to show updated sections immediately:
  // revalidatePath(`/admin/guides/${guideId}/edit`);
}
