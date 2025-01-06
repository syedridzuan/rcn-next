// File: app/admin/recipes/drafts/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Server action: delete a draft by ID, then revalidate the listing.
 */
export async function deleteDraftRecipeAction(draftId: string) {
  if (!draftId) return { error: "No draftId provided." };

  try {
    await prisma.draftRecipe.delete({ where: { id: draftId } });
    revalidatePath("/admin/recipes/drafts");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete draft:", err);
    return { error: err.message };
  }
}
