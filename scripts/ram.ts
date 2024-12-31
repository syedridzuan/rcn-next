#!/usr/bin/env tsx
/**
 * scripts/recipeAuditMultiModel.ts
 *
 * Usage:
 *   npx tsx scripts/recipeAuditMultiModel.ts [slug-of-recipe]
 *
 * Example:
 *   npx tsx scripts/recipeAuditMultiModel.ts kuih-seri-muka
 */

import { config } from "dotenv";
import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { buildRecipeText } from "@/lib/buildRecipeText";

// Load environment variables from .env
config();

// 1. Define available models & pricing
const OPENAI_MODELS = {
  GPT_3_5_TURBO: {
    name: "gpt-3.5-turbo",
    inputCostPer1KTokens: 0.0015,
    outputCostPer1KTokens: 0.002,
  },
  GPT_4O: {
    name: "gpt-4o",
    inputCostPer1KTokens: 0.005,
    outputCostPer1KTokens: 0.015,
  },
  // ...Add additional model definitions if needed
};

// Pick one model as your default
const SELECTED_MODEL = OPENAI_MODELS.GPT_4O;

// 2. Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Utility: remove triple-backtick fenced code blocks.
 */
function removeMarkdownFences(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, (match) => {
      const innerContent = match
        .replace(/```(json|js|.*)?/g, "")
        .replace(/```/g, "");
      return innerContent.trim();
    })
    .trim();
}

/**
 * Utility: parse strings like "15 minutes" into an integer (e.g. 15).
 * If no integer is found, returns `null`.
 */
function parseTimeString(timeStr: any): number | null {
  if (!timeStr || typeof timeStr !== "string") {
    if (typeof timeStr === "number") {
      return timeStr; // Already a valid integer
    }
    return null;
  }
  const match = timeStr.match(/\d+/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Utility: map user-friendly Malay synonyms to your Prisma difficulty enum.
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
      return "MEDIUM";
  }
}

/**
 * Utility: map user-friendly strings to your ServingType enum.
 * e.g. (PEOPLE, SLICES, PIECES, PORTIONS, BOWLS, GLASSES, etc.)
 */
function mapServingType(
  input: string
): "PEOPLE" | "SLICES" | "PIECES" | "PORTIONS" | "BOWLS" | "GLASSES" {
  const normalized = input.trim().toUpperCase();
  switch (normalized) {
    case "SLICES":
    case "SLICE":
      return "SLICES";
    case "PIECES":
    case "PIECE":
      return "PIECES";
    case "BOWLS":
    case "BOWL":
      return "BOWLS";
    case "GLASSES":
    case "GLASS":
      return "GLASSES";
    case "PORTIONS":
    case "PORTION":
      return "PORTIONS";
    default:
      return "PEOPLE"; // fallback
  }
}

async function main() {
  try {
    const slugArg = process.argv[2];
    if (!slugArg) {
      throw new Error("Please provide a recipe slug, e.g. kuih-seri-muka");
    }
    console.log(`🔎 Auditing recipe with slug: ${slugArg}`);

    const recipe = await prisma.recipe.findUnique({ where: { slug: slugArg } });
    if (!recipe) {
      throw new Error(`Recipe not found for slug: ${slugArg}`);
    }
    console.log(`✅ Found recipe: ${recipe.title}`);

    // Use the buildRecipeText helper to assemble text from multiple fields
    const recipeText = buildRecipeText(recipe);
    console.log("📝 Recipe text for analysis:", recipeText);

    // ChatGPT request
    console.log(
      `⏳ Sending data to ChatGPT using model: ${SELECTED_MODEL.name}…`
    );
    const chatResponse = await openai.chat.completions.create({
      model: SELECTED_MODEL.name,
      messages: [
        {
          role: "user",
          content: `
Anda adalah asisten masakan.
Sila analisis teks resipi di bawah dan berikan output JSON (tanpa sebarang markdown fences) dengan struktur berikut:

{
  "prepTime": "wajib dalam minit sahaja, cth: 15 min, 30 min, 90 min",
  "cookTime": "juga wajib dalam minit sahaja, cth: 20 min, 60 min",
  "difficulty": "MUDAH / SEDANG / SUKAR atau setara",
  "servings": 4,
  "servingType": "pieces / slices / people / ...",
  "tags": ["string1","string2","string3"]
}

- Jangan guna jam (hour). Gunakan minit sahaja bagi masa.
- Teks resipi:
${recipeText}
`,
        },
      ],
      temperature: 0,
    });

    const rawContent = chatResponse.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("ChatGPT did not return content for recipe analysis.");
    }
    console.log("🔎 ChatGPT raw output:", rawContent);

    // Remove any triple-backtick formatting
    const cleaned = removeMarkdownFences(rawContent);
    console.log("🔎 Cleaned JSON data:", cleaned);

    // Attempt to parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("⚠️ Error parsing JSON from ChatGPT:", err);
      throw err;
    }
    console.log("✅ Parsed JSON:", parsed);

    // 1) Parse times
    const parsedPrepTime = parseTimeString(parsed.prepTime);
    const parsedCookTime = parseTimeString(parsed.cookTime);

    // 2) Map difficulty if provided
    let finalDiff: "EASY" | "MEDIUM" | "HARD" | "EXPERT" | null = null;
    if (parsed.difficulty) {
      finalDiff = mapDifficulty(parsed.difficulty);
    }

    // 3) Map servingType if provided
    let finalServingType:
      | "PEOPLE"
      | "SLICES"
      | "PIECES"
      | "PORTIONS"
      | "BOWLS"
      | "GLASSES"
      | null = null;
    if (parsed.servingType) {
      finalServingType = mapServingType(parsed.servingType);
    }

    // 4) Update recipe: only the openai columns
    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        openaiPrepTime: parsedPrepTime,
        openaiCookTime: parsedCookTime,
        openaiServings:
          typeof parsed.servings === "number" ? parsed.servings : null,
        openaiDifficulty: finalDiff,
        openaiTags: parsed.tags ?? null,
        openaiServingType: finalServingType,
      },
    });

    console.log(
      "✅ Recipe updated in DB with ChatGPT data (openai columns):",
      updated
    );

    // 5) Token usage & cost calculation
    const usage = chatResponse.usage;
    if (usage) {
      const { prompt_tokens, completion_tokens, total_tokens } = usage;
      console.log("\n💡 Usage Info:");
      console.log(`- prompt_tokens:      ${prompt_tokens}`);
      console.log(`- completion_tokens:  ${completion_tokens}`);
      console.log(`- total_tokens:       ${total_tokens}`);

      const inputCost =
        (prompt_tokens / 1000) * SELECTED_MODEL.inputCostPer1KTokens;
      const outputCost =
        (completion_tokens / 1000) * SELECTED_MODEL.outputCostPer1KTokens;
      const totalCost = inputCost + outputCost;

      console.log(
        `\n💲 Estimated cost @ ${SELECTED_MODEL.name}: $${totalCost.toFixed(6)}`
      );
    } else {
      console.log("\n⚠️ Usage information is missing from the response.");
    }

    console.log("🎉 Recipe audit complete.");
  } catch (error) {
    console.error("❌ An error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
main();
