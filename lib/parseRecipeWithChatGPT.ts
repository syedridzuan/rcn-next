#!/usr/bin/env tsx
/**
 * scripts/recipeAudit.ts
 *
 * Usage:
 *   npx tsx scripts/recipeAudit.ts [slug-of-recipe]
 *
 * Example:
 *   npx tsx scripts/recipeAudit.ts kuih-seri-muka
 *
 * This script fetches a recipe by slug, sends it to ChatGPT for analysis,
 * then maps the difficulty (e.g. SUKAR) to a valid Prisma enum (HARD, etc.),
 * updates the record in the DB,
 * and logs approximate token usage cost.
 */
import { config } from "dotenv";
import OpenAI from "openai";
import { prisma } from "@/lib/db";

config();

// 1. Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper to map any Malay synonyms or other unknown values
 * to your valid Prisma enum: EASY, MEDIUM, HARD, or EXPERT.
 */
function mapDifficulty(input: string): "EASY" | "MEDIUM" | "HARD" | "EXPERT" {
  const normalized = input.trim().toUpperCase();

  switch (normalized) {
    case "SUKAR":
    case "SUSAHSANGAT":
    case "SANGAT_SUKAR":
      return "HARD";

    case "MUDAH":
      return "EASY";

    case "SEDANG":
    case "SEDERHANA":
      return "MEDIUM";

    case "EXPERT":
    case "PAKAR":
      return "EXPERT";

    default:
      // fallback if ChatGPT returns something unrecognized
      return "MEDIUM";
  }
}

// Approximate cost rate for GPT-3.5-Turbo at time of writing (8k model):
// $0.0015 per 1,000 tokens for the combined input + output usage.
const COST_PER_1K_TOKENS = 0.0015;

async function main() {
  try {
    // 2. Read CLI argument for the recipe slug
    const slugArg = process.argv[2];
    if (!slugArg) {
      throw new Error("Please provide a recipe slug, e.g. kuih-seri-muka");
    }
    console.log(`🔎 Auditing recipe with slug: ${slugArg}`);

    // 3. Fetch the recipe from your DB
    const recipe = await prisma.recipe.findUnique({
      where: { slug: slugArg },
    });
    if (!recipe) {
      throw new Error(`Recipe not found for slug: ${slugArg}`);
    }
    console.log(`✅ Found recipe: ${recipe.title}`);

    // 4. Prepare the text to analyze
    const recipeText = recipe.description || "(no description provided)";

    // 5. Send the content to ChatGPT
    console.log("⏳ Sending data to ChatGPT…");
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
Anda adalah asisten masakan.
Sila analisis teks resipi di bawah dan ekstrak maklumat berikut dalam format JSON:
- Masa penyediaan (prepTime)
- Masa memasak (cookTime)
- Kesukaran (difficulty)
- Hidangan (servings)
- Kata kunci/tags (array)

Teks resipi:
${recipeText}

Contoh format jawapan:
{
  "prepTime": 30,
  "cookTime": 45,
  "difficulty": "MEDIUM",
  "servings": 5,
  "tags": ["pedas", "ayam", "berempah"]
}
`,
        },
      ],
      temperature: 0,
    });

    // 6. Extract the returned text
    const rawContent = chatResponse.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("ChatGPT did not return content for recipe analysis.");
    }
    console.log("🔎 ChatGPT raw output:", rawContent);

    // 7. Attempt to parse JSON
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch (err) {
      console.error("⚠️ Error parsing JSON from ChatGPT:", err);
      throw err;
    }
    console.log("✅ Parsed JSON:", parsedResult);

    // 8. Convert difficulty from ChatGPT into your Prisma enum
    let finalDifficulty = recipe.difficulty; // fallback to existing if nothing new
    if (parsedResult.difficulty) {
      finalDifficulty = mapDifficulty(parsedResult.difficulty);
    }

    // 9. Update the recipe in your DB
    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        cookTime: parsedResult.cookTime ?? recipe.cookTime,
        prepTime: parsedResult.prepTime ?? recipe.prepTime,
        servings: parsedResult.servings ?? recipe.servings,
        difficulty: finalDifficulty, // mapped to valid enum
        // For tags, you'd handle them if you store them in a separate relation
      },
    });
    console.log("✅ Recipe updated in DB with ChatGPT data:", updated);

    // 10. Token usage and cost calculation
    // OpenAI's response object includes `usage` info if you're on an API plan
    const usage = chatResponse.usage;
    if (usage) {
      const { prompt_tokens, completion_tokens, total_tokens } = usage;
      console.log(`\n💡 Usage Info:`);
      console.log(`- prompt_tokens:    ${prompt_tokens}`);
      console.log(`- completion_tokens: ${completion_tokens}`);
      console.log(`- total_tokens:      ${total_tokens}`);

      const cost = (total_tokens / 1000) * COST_PER_1K_TOKENS;
      console.log(`\n💲 Estimated cost @ GPT-3.5-Turbo: $${cost.toFixed(6)}`);
    } else {
      console.log("\n⚠️ Usage information is not available in this response.");
    }

    // Done
    console.log("\n🎉 Recipe audit complete.");
  } catch (error) {
    console.error("❌ An error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
main();
