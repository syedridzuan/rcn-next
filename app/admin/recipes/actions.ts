"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

interface RecipeItemData {
  content: string;
}

interface RecipeSectionData {
  title: string;
  type: string;
  items: RecipeItemData[];
}

interface RecipeTipData {
  content: string;
}

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
  sections: RecipeSectionData[];
  /**
   * Each tip is { content: string }
   * Make sure to pass an array of objects from the client or JSON parse
   */
  tips: RecipeTipData[];
  tags?: string[];
  isEditorsPick: boolean;
}

// CREATE a new recipe
export async function createRecipe(data: RecipeFormData) {
  // 1. Ensure the user is logged in
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a recipe.");
  }

  // 2. Generate a unique slug for the recipe
  const slug = slugify(data.title);

  // 3. Ensure no existing recipe with this slug
  const existingRecipe = await prisma.recipe.findUnique({
    where: { slug },
  });
  if (existingRecipe) {
    throw new Error("A recipe with this title (slug) already exists.");
  }

  // 4. Prepare auto-slugified tags
  const tagsData = data.tags?.map((tagName) => {
    const tagSlug = slugify(tagName);
    return {
      where: { slug: tagSlug },
      create: { name: tagName, slug: tagSlug },
    };
  });

  // 5. Create the recipe in Prisma
  await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      language: data.language,
      cookTime: data.cookTime,
      prepTime: data.prepTime,
      servings: data.servings,
      difficulty: data.difficulty,
      slug,
      categoryId: data.categoryId,
      userId: session.user.id,

      // Sections with items
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          type: section.type,
          items: {
            // items is array of { content: string }
            create: section.items.map((item) => ({ content: item.content })),
          },
        })),
      },

      // Tips: array of objects, each with "content"
      tips: data.tips?.length
        ? {
            create: data.tips.map((tip) => ({
              content: tip.content,
            })),
          }
        : undefined,

      // Tags
      tags: tagsData?.length
        ? {
            connectOrCreate: tagsData,
          }
        : undefined,

      isEditorsPick: data.isEditorsPick,
    },
  });

  // 6. Revalidate your recipes admin path (or wherever needed)
  revalidatePath("/admin/recipes");
  return { success: true };
}

// UPDATE an existing recipe
export async function updateRecipe(id: string, data: RecipeFormData) {
  // 1. Ensure the user is logged in
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a recipe.");
  }

  // 2. Check if the recipe exists
  const existingRecipe = await prisma.recipe.findUnique({
    where: { id },
  });
  if (!existingRecipe) {
    throw new Error(`Recipe with id ${id} not found.`);
  }

  // 3. Verify ownership
  if (existingRecipe.userId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this recipe.");
  }

  // 4. Remove old sections, items, tips (to fully replace them)
  await prisma.recipeItem.deleteMany({
    where: { section: { recipeId: id } },
  });
  await prisma.recipeSection.deleteMany({
    where: { recipeId: id },
  });
  await prisma.recipeTip.deleteMany({
    where: { recipeId: id },
  });

  // 5. Disconnect all tags so we can replace with new data
  await prisma.recipe.update({
    where: { id },
    data: { tags: { set: [] } },
  });

  // 6. Prepare auto-slugified tags
  const tagsData = data.tags?.map((tagName) => {
    const tagSlug = slugify(tagName);
    return {
      where: { slug: tagSlug },
      create: { name: tagName, slug: tagSlug },
    };
  });

  // 7. Update the recipe
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
            create: data.tips.map((tip) => {
              // If tip is a string, convert to { content: tip }
              // If tip is already an object, pass it through
              if (typeof tip === "string") {
                return { content: tip };
              }
              return tip; // or { content: 'Invalid tip' } fallback
            }),
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

  // 8. Revalidate the admin/recipes page
  revalidatePath("/admin/recipes");
  return { success: true };
}

// DELETE a recipe
export async function deleteRecipe(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a recipe.");
  }

  // Check if user is owner
  await prisma.recipe.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/recipes");
  return { success: true };
}
