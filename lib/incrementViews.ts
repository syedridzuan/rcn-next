// lib/incrementViews.ts
import { redisClient } from "./redis";

/**
 * Increments the “views” count for a particular recipe.
 */
export async function incrementRecipeView(recipeId: string) {
  try {
    // “HINCRBY recipe:views recipeId 1”
    await redisClient.hincrby("recipe:views", recipeId, 1);
  } catch (error) {
    console.error("Error incrementing recipe view:", error);
  }
}
