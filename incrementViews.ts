// example: incrementViews.ts
import { redisClient } from "@/../redis";

export async function incrementRecipeView(recipeId: string) {
  // HINCRBY key field increment
  await redisClient.hIncrBy("recipe:views", recipeId, 1);
}
