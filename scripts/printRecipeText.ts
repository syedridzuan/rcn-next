#!/usr/bin/env tsx
/**
 * scripts/printRecipeText.ts
 *
 * Usage:
 *   npx tsx scripts/printRecipeText.ts [slug]
 *
 * Example:
 *   npx tsx scripts/printRecipeText.ts kuih-seri-muka-niaga-2
 *
 * Description:
 *   Fetches a single recipe by its slug, joins the related data
 *   (category, sections, items, tips, tags, etc.), then passes
 *   the full object to buildRecipeText() and prints the result.
 */

import { config } from "dotenv";
import { prisma } from "../lib/db"; // adjust path if needed
import { buildRecipeText } from "../lib/buildRecipeText"; // adjust path if needed

config(); // loads .env variables, if you need them for Prisma

async function main() {
  // 1. Grab the slug from CLI arguments
  const slugArg = process.argv[2];
  if (!slugArg) {
    throw new Error("Please provide a recipe slug, e.g. kuih-seri-muka");
  }
  console.log(`🔎 Looking up recipe with slug: ${slugArg}`);

  // 2. Fetch the recipe from DB, including related data
  const recipe = await prisma.recipe.findUnique({
    where: { slug: slugArg },
    // Ensure you join the relevant relations:
    // category, sections & items, tips, tags, etc.
    include: {
      category: true,
      sections: {
        include: {
          items: true,
        },
      },
      tips: true, // If your tips are stored in a separate relation
      tags: true, // If your tags are in a many-to-many relation
    },
  });

  if (!recipe) {
    throw new Error(`No recipe found for slug: ${slugArg}`);
  }
  console.log(`✅ Found recipe: ${recipe.title}\n`);

  // 3. Generate the plain-text representation using buildRecipeText
  const textOutput = buildRecipeText(recipe);
  console.log("=== buildRecipeText Output ===\n");
  console.log(textOutput);
  console.log("\n=== End ===");
}

// Run the script and handle errors
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error running printRecipeText script:", err);
    process.exit(1);
  });
