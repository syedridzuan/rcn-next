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
  // Add more as needed
};

// Pick one model as your default
const SELECTED_MODEL = OPENAI_MODELS.GPT_4O;

// 2. Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Utility: remove triple-backtick fenced code blocks (```json ... ```).
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
 * Utility: attempt to parse a time string like "15 min" or "2 hours" into integer minutes.
 * If unparseable, returns null.
 */
function parseTimeToMinutes(timeStr: any): number | null {
  if (!timeStr) return null;

  // If ChatGPT gave a number directly
  if (typeof timeStr === "number") {
    return timeStr;
  }
  if (typeof timeStr !== "string") {
    return null;
  }

  const lower = timeStr.toLowerCase().trim();
  // e.g. "15 min" or "30 mins"
  const matchMin = lower.match(/^(\d+)\s*(min|mins|minutes)$/);
  if (matchMin) {
    return parseInt(matchMin[1], 10);
  }

  // e.g. "2 hour" or "3 hours"
  const matchHour = lower.match(/^(\d+)\s*(hour|hours|jam)$/);
  if (matchHour) {
    const hours = parseInt(matchHour[1], 10);
    return Number.isNaN(hours) ? null : hours * 60;
  }

  // e.g. "1 jam 30 min" => partial approach:
  const matchMixed = lower.match(
    /^(\d+)\s*(hour|hours|jam)\s+(\d+)\s*(min|mins|minutes)$/
  );
  if (matchMixed) {
    const hours = parseInt(matchMixed[1], 10);
    const mins = parseInt(matchMixed[3], 10);
    if (!Number.isNaN(hours) && !Number.isNaN(mins)) {
      return hours * 60 + mins;
    }
  }

  // If not matched, return null
  return null;
}

/**
 * Utility: map user-friendly Malay synonyms to your Prisma difficulty enum.
 */
function mapDifficulty(input: string): "EASY" | "MEDIUM" | "HARD" | "EXPERT" {
  const normalized = input.trim().toUpperCase();
  switch (normalized) {
    case "SUKAR":
    case "SANGAT_SUKAR":
    case "SUSAHSANGAT":
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
 * Utility: map user-friendly strings to your ServingType enum (PEOPLE, PIECES, etc.)
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
      return "PEOPLE";
  }
}

async function main() {
  try {
    const slugArg = process.argv[2];
    if (!slugArg) {
      throw new Error("Please provide a recipe slug, e.g. kuih-seri-muka");
    }
    console.log(`🔎 Auditing recipe with slug: ${slugArg}`);

    // Include sections/items so buildRecipeText can produce a more complete text
    const recipe = await prisma.recipe.findUnique({
      where: { slug: slugArg },
      include: {
        sections: {
          include: { items: true },
        },
        tips: true,
        tags: true,
        category: true,
      },
    });
    if (!recipe) {
      throw new Error(`Recipe not found for slug: ${slugArg}`);
    }
    console.log(`✅ Found recipe: ${recipe.title}`);

    // Assemble text from multiple fields
    const recipeText = buildRecipeText(recipe);
    console.log("📝 Recipe text for analysis:----->", recipeText);

    // Request to ChatGPT
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
Sila analisis teks resipi di bawah dan ekstrak maklumat berikut dalam format JSON (tanpa sebarang markdown fences):
- Masa penyediaan (prepTime) — integer atau string, cth "15 min"
- Masa memasak (cookTime) — integer atau string, cth "20 min"
- Masa keseluruhan (totalTime) — integer atau string, cth "1 jam 30 min"
- Kesukaran (difficulty)
- Hidangan (servings) — integer
- Jenis hidangan (servingType) — cth "pieces", "people", "slices"
- Kata kunci/tags (array) — senarai ringkas perkataan kunci

Teks resipi:
${recipeText}

Contoh format jawapan:
{
  "prepTime": "15 minutes",
  "cookTime": "20 minutes",
  "totalTime": "1 jam 30 min",
  "difficulty": "MUDAH",
  "servings": 12,
  "servingType": "pieces",
  "tags": ["apam", "kukus", "coklat"]
}
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

    // Remove markdown fences
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

    // A) PrepTime
    let finalPrepTime: number | null = null;
    let finalPrepTimeText: string | null = null;
    if (parsed.prepTime) {
      const minutes = parseTimeToMinutes(parsed.prepTime);
      if (minutes !== null) {
        finalPrepTime = minutes;
        finalPrepTimeText = null;
      } else {
        finalPrepTime = null;
        finalPrepTimeText = parsed.prepTime;
      }
    }

    // B) CookTime
    let finalCookTime: number | null = null;
    let finalCookTimeText: string | null = null;
    if (parsed.cookTime) {
      const minutes = parseTimeToMinutes(parsed.cookTime);
      if (minutes !== null) {
        finalCookTime = minutes;
        finalCookTimeText = null;
      } else {
        finalCookTime = null;
        finalCookTimeText = parsed.cookTime;
      }
    }

    // C) TotalTime
    let finalTotalTime: number | null = null;
    let finalTotalTimeText: string | null = null;
    if (parsed.totalTime) {
      const minutes = parseTimeToMinutes(parsed.totalTime);
      if (minutes !== null) {
        finalTotalTime = minutes;
        finalTotalTimeText = null;
      } else {
        finalTotalTime = null;
        finalTotalTimeText = parsed.totalTime;
      }
    }

    // Map difficulty => enum
    let finalDiff = null;
    if (parsed.difficulty) {
      finalDiff = mapDifficulty(parsed.difficulty);
    }

    // Map serving type => enum
    let finalServingType = null;
    if (parsed.servingType) {
      finalServingType = mapServingType(parsed.servingType);
    }

    // 4) Update recipe: only the openai columns
    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        // Prep
        openaiPrepTime: finalPrepTime,
        openaiPrepTimeText: finalPrepTimeText,

        // Cook
        openaiCookTime: finalCookTime,
        openaiCookTimeText: finalCookTimeText,

        // Total
        openaiTotalTime: finalTotalTime,
        openaiTotalTimeText: finalTotalTimeText,

        // Difficulty, Servings, ServingType, Tags
        openaiDifficulty: finalDiff,
        openaiServings:
          typeof parsed.servings === "number" ? parsed.servings : null,
        openaiServingType: finalServingType,
        openaiTags: parsed.tags ?? null,
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

main();
