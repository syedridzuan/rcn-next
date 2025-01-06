"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { generateSlug } from "@/lib/utils/slug";

/**
 * A server action to update an existing DraftRecipe record.
 * e.g., the user edits title, description, etc.
 */
export async function updateDraftRecipeAction(
  draftId: string,
  data: {
    title?: string;
    description?: string;
    shortDescription?: string;
    prepTime?: number | null;
    cookTime?: number | null;
    totalTime?: number | null;
    difficulty?: string | null;
    servings?: number | null;
    servingType?: string | null;
    tags?: string[];
    tips?: any;
    sections?: any;
    //slug?: string;
  }
) {
  "use server";

  // 1) Check user auth
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authorized. Please log in first." };
  }

  try {
    // 2) Update the DraftRecipe with the provided data
    const updated = await prisma.draftRecipe.update({
      where: { id: draftId },
      data,
    });

    const safeOpenaiCost = updated.openaiCost?.toString() ?? null;
    // 3) Optionally revalidate the page listing all drafts
    revalidatePath("/admin/recipes/drafts");

    // 4) Return success
    return {
      success: true,
      updated: {
        ...updated,
        openaiCost: safeOpenaiCost,
      },
    };
  } catch (err: any) {
    console.error("updateDraftRecipeAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function publishDraftRecipeAction(
  draftId: string,
  userSlug?: string
) {
  try {
    // 1) Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Not authorized. Please log in first." };
    }
    const userId = session.user.id;

    // 2) Load the draft
    const draft = await prisma.draftRecipe.findUnique({
      where: { id: draftId },
    });
    if (!draft) {
      return { error: "Draft not found." };
    }

    // 3) Generate or use provided slug for the final recipe
    const fallbackTitle = draft.title || "Untitled";
    let finalSlug = (userSlug ?? "").trim();
    if (!finalSlug) {
      finalSlug = generateSlug(fallbackTitle);
    }

    // Check for slug collision
    const existing = await prisma.recipe.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      return {
        error: `Slug "${finalSlug}" already exists. Please use another slug or title.`,
      };
    }

    // 4) Prepare a recipeData object
    const recipeData: any = {
      slug: finalSlug,
      title: draft.title ?? "Untitled",
      description: draft.description ?? "",
      shortDescription: draft.shortDescription ?? "",
      prepTime: draft.prepTime ?? 0,
      cookTime: draft.cookTime ?? 0,
      totalTime: draft.totalTime ?? 0,
      difficulty: draft.difficulty ?? "MEDIUM",
      servings: draft.servings ?? 0,
      servingType: draft.servingType ?? null,
      user: { connect: { id: userId } },
    };

    // 5) If the draft has tags, use connectOrCreate
    if (draft.tags?.length) {
      recipeData.tags = {
        connectOrCreate: draft.tags.map((tagName: string) => {
          const tagSlug = generateSlug(tagName);
          return {
            where: { slug: tagSlug },
            create: {
              name: tagName,
              slug: tagSlug,
            },
          };
        }),
      };
    }

    // 6) Create the new Recipe
    const newRecipe = await prisma.recipe.create({
      data: recipeData,
    });

    // 7) Insert sections & items in the same order
    if (draft.sections && Array.isArray(draft.sections)) {
      for (const section of draft.sections) {
        const newSection = await prisma.recipeSection.create({
          data: {
            title: section.title || "Untitled Section",
            type: section.type || "INGREDIENTS",
            recipeId: newRecipe.id,
          },
        });

        if (Array.isArray(section.items)) {
          for (const item of section.items) {
            if (item?.content) {
              await prisma.recipeItem.create({
                data: {
                  content: item.content,
                  sectionId: newSection.id,
                },
              });
            }
          }
        }
      }
    }

    // 8) If draft.tips is an array, convert them to RecipeTip
    if (draft.tips && Array.isArray(draft.tips)) {
      for (const tipObj of draft.tips) {
        if (tipObj?.content) {
          await prisma.recipeTip.create({
            data: {
              content: tipObj.content,
              recipeId: newRecipe.id,
            },
          });
        }
      }
    }

    // 9) Optionally delete the DraftRecipe or keep it
    // await prisma.draftRecipe.delete({ where: { id: draftId } });

    // Revalidate if needed
    revalidatePath("/admin/recipes/drafts");

    return { success: true, recipeId: newRecipe.id, slug: finalSlug };
  } catch (err: any) {
    console.error("publishDraftRecipeAction error:", err);
    return { error: err.message };
  }
}
