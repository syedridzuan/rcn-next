"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

// ... other imports

interface RecipeFormData {
  title: string;
  description?: string;
  shortDescription?: string;
  language: string;
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty: string;
  categoryId: string;
  sections: Array<{
    title: string;
    type: string;
    items: Array<{ content: string }>;
  }>;
  tips?: string[]; // or objects if you store { content }
  tags?: string[];
  isEditorsPick: boolean;
  status?: string; // <--- must be added if you want to set recipe status
}

// UPDATE an existing recipe
export async function updateRecipe(id: string, data: RecipeFormData) {
  // 1) Ensure the user is logged in
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a recipe.");
  }

  // 2) Check if the recipe exists
  const existingRecipe = await prisma.recipe.findUnique({
    where: { id },
  });
  if (!existingRecipe) {
    throw new Error(`Recipe with id ${id} not found.`);
  }

  // 3) Verify ownership (if you need to ensure only the creator can edit)
  if (existingRecipe.userId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this recipe.");
  }

  // 4) Remove old sections, items, tips (fully replace them)
  await prisma.recipeItem.deleteMany({
    where: { section: { recipeId: id } },
  });
  await prisma.recipeSection.deleteMany({
    where: { recipeId: id },
  });
  await prisma.recipeTip.deleteMany({
    where: { recipeId: id },
  });

  // 5) Disconnect all tags so we can replace with new data
  await prisma.recipe.update({
    where: { id },
    data: { tags: { set: [] } },
  });

  // 6) Prepare connectOrCreate data for tags
  const tagsData = data.tags?.map((tagName) => {
    const tagSlug = slugify(tagName);
    return {
      where: { slug: tagSlug },
      create: { name: tagName, slug: tagSlug },
    };
  });

  // 7) Update the recipe
  //    If user updates title/description but remains in DRAFT, publishedAt remains null.
  //    If user sets status to PUBLISHED, then publishedAt = now.
  await prisma.recipe.update({
    where: {
      id,
      userId: session.user.id, // prevents tampering by non-owners
    },
    data: {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      categoryId: data.categoryId,
      status: data.status, // if you're storing the new status

      publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,

      // Re-create sections + items
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          type: section.type,
          items: {
            create: section.items.map((it) => ({ content: it.content })),
          },
        })),
      },

      // Re-create tips
      tips: data.tips?.length
        ? {
            create: data.tips.map((tip) =>
              typeof tip === "string" ? { content: tip } : tip
            ),
          }
        : undefined,

      // Re-connect or create tags
      tags: tagsData?.length
        ? {
            connectOrCreate: tagsData,
          }
        : undefined,

      isEditorsPick: data.isEditorsPick,
    },
  });

  // 8) Revalidate
  revalidatePath("/admin/recipes");
  return { success: true };
}
