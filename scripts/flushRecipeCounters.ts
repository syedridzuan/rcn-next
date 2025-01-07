#!/usr/bin/env tsx
import "dotenv/config";
import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

/**
 * Flush recipe view counters from Redis into your Prisma database.
 */
export async function flushRecipeCounters() {
  try {
    console.log("🔄 Starting flush operation...");

    // 1. Fetch all view counters (fallback to {} if null)
    const viewCounters = (await redisClient.hgetall("recipe:views")) || {};
    console.log("📊 View counters from Redis:", viewCounters);

    // 2. Clear Redis key for views
    await redisClient.del("recipe:views");
    console.log("🗑️ Cleared Redis view counters");

    // 3. Batch update in Prisma
    let updatedCount = 0;

    // Update views
    for (const [recipeId, strCount] of Object.entries(viewCounters)) {
      const count = parseInt(strCount, 10);
      console.log(`📝 Updating recipe ${recipeId} with +${count} views`);

      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          // Adjust this field name to match your schema:
          viewCount: {
            increment: count,
          },
        },
      });
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} recipe records.`);
    return { success: true, updatedRecipes: updatedCount };
  } catch (error) {
    console.error("❌ Error in flushRecipeCounters:", error);
    throw error;
  }
}

// Run script directly (e.g. `npx tsx flushRecipeCounters.ts`)
if (require.main === module) {
  flushRecipeCounters()
    .then((result) => {
      console.log("flushRecipeCounters returned:", result);
    })
    .catch((error) => {
      console.error("Error in flushRecipeCounters:", error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
}
