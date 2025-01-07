// example: incrementLikes.ts
import { redisClient } from "@/../redis";

export async function incrementRecipeLike(recipeId: string) {
  await redisClient.hIncrBy("recipe:likes", recipeId, 1);
}
