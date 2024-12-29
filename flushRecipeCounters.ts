// example: flushRecipeCounters.ts
import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function flushRecipeCounters() {
  try {
    // 1. Get all view counters
    const viewCounters = await redisClient.hGetAll("recipe:views");
    // viewCounters will be an object like { "abc123": "4", "xyz999": "10" }

    // 2. Get all like counters
    const likeCounters = await redisClient.hGetAll("recipe:likes");

    // 3. Clear out the Redis hashes so we don't double-count next time
    await redisClient.del("recipe:views");
    await redisClient.del("recipe:likes");

    // 4. Batch update in DB
    // (a) Update views
    for (const [recipeId, strCount] of Object.entries(viewCounters)) {
      const count = parseInt(strCount, 10);
      // example with Prisma:
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          // e.g., if you have a "views" column in your schema
          views: { increment: count },
        },
      });
    }

    // (b) Update likes
    for (const [recipeId, strCount] of Object.entries(likeCounters)) {
      const count = parseInt(strCount, 10);
      // e.g., if you have a "likes" column or something similar:
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          likes: { increment: count }, // or some structure you define
        },
      });
    }
  } catch (err) {
    console.error("Failed to flush recipe counters from Redis:", err);
  } finally {
    // Optionally disconnect from Prisma if needed
    await prisma.$disconnect();
  }
}
