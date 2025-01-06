// File: app/admin/recipes/generate/actions.ts
"use server";

import { prisma } from "@/lib/db";
import OpenAI from "openai";

/**
 * Create our OpenAI client (v4).
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * A server action that:
 * 1) Logs steps for debugging
 * 2) Calls OpenAI v4 chat.completions.create
 * 3) Parses JSON from GPT
 * 4) Safely validates/falls back on fields (title, difficulty, etc.)
 * 5) Logs the final data object before inserting to DB
 * 6) Inserts a new DraftRecipe record (with rawOpenAIResponse & promptUsed)
 * 7) Ensures openaiCost is never NaN/null
 */
export async function generateRecipeDraftAction(
  script: string,
  prompt: string
) {
  console.log(
    "▶ [generateRecipeDraftAction] Called with script length:",
    script.length
  );
  console.log(
    "▶ [generateRecipeDraftAction] Called with prompt length:",
    prompt.length
  );

  // Basic validation
  if (!script) {
    console.log("⚠ [generateRecipeDraftAction] No script provided!");
    return { error: "Please provide a script." };
  }

  // 1) Call OpenAI
  let openaiResponse: any;
  try {
    console.log(
      "▶ [generateRecipeDraftAction] Attempting to call OpenAI chat.completions.create..."
    );
    openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt.trim() },
        { role: "user", content: script.trim() },
      ],
      temperature: 0,
    });
    console.log("✅ [generateRecipeDraftAction] OpenAI call succeeded.");
  } catch (err: any) {
    console.error("❌ [generateRecipeDraftAction] OpenAI error:", err);
    return { error: "OpenAI request failed. " + err.message };
  }

  // 2) Parse the GPT output
  const content = openaiResponse?.choices?.[0]?.message?.content;
  if (!content) {
    console.log(
      "⚠ [generateRecipeDraftAction] No content returned from OpenAI."
    );
    return { error: "OpenAI returned empty response." };
  }

  console.log(content);

  let parsedData: any;
  try {
    parsedData = JSON.parse(content);
    console.log(
      "✅ [generateRecipeDraftAction] JSON parsed successfully:",
      parsedData
    );
  } catch (err) {
    console.error("❌ [generateRecipeDraftAction] JSON parse error:", err);
    return { error: "Failed to parse JSON from OpenAI." };
  }

  // 3) Validate/fallback certain fields
  // Title fallback
  if (!parsedData.title || typeof parsedData.title !== "string") {
    parsedData.title = "Resepi Tanpa Nama";
  }

  // Difficulty fallback
  if (!["EASY", "MEDIUM", "HARD", "EXPERT"].includes(parsedData.difficulty)) {
    parsedData.difficulty = "MEDIUM";
  }

  // If sections are missing or not an array, fallback to empty
  if (!Array.isArray(parsedData.sections)) {
    parsedData.sections = [];
  }

  // shortDescription, description could remain empty strings if null
  if (!parsedData.shortDescription) {
    parsedData.shortDescription = "";
  }
  if (!parsedData.description) {
    parsedData.description =
      "Tiada keterangan terperinci tersedia untuk resepi ini.";
  }

  // 4) Handle tokens & cost
  const totalTokens = openaiResponse.usage?.total_tokens ?? 0;
  let approximateCost = (totalTokens / 1000) * 0.0015;
  if (!Number.isFinite(approximateCost)) {
    approximateCost = 0;
  }

  console.log(
    "▶ [generateRecipeDraftAction] totalTokens =",
    totalTokens,
    "| approximateCost =",
    approximateCost
  );

  // 5) Prepare the data object and log it
  const draftData = {
    // Fallbacked fields
    title: parsedData.title,
    description: parsedData.description,
    shortDescription: parsedData.shortDescription,

    // Difficulty (validated above)
    difficulty: parsedData.difficulty,

    // Numeric fields can stay null if GPT didn't provide them
    prepTime: parsedData.prepTime ?? null,
    cookTime: parsedData.cookTime ?? null,
    totalTime: parsedData.totalTime ?? null,
    servings: parsedData.servings ?? null,
    servingType: parsedData.servingType ?? null,

    // Arrays or JSON
    tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
    tips: parsedData.tips ?? null,
    sections: parsedData.sections ?? null,

    // Logging usage
    openaiTokensUsed: totalTokens,
    openaiModel: openaiResponse.model ?? "gpt-3.5-turbo",
    // Store cost as string to avoid decimal issues
    openaiCost: approximateCost.toString(),

    // Storing raw data for debugging
    rawOpenAIResponse: JSON.stringify(openaiResponse),
    promptUsed: prompt,
  };

  console.log(
    ">>> [generateRecipeDraftAction] Final draftData to insert:",
    JSON.stringify(draftData, null, 2)
  );

  // 6) Insert into DraftRecipe
  try {
    console.log("▶ [generateRecipeDraftAction] Inserting draft into DB...");
    const newDraft = await prisma.draftRecipe.create({
      data: draftData,
    });
    console.log(
      "✅ [generateRecipeDraftAction] Draft created with ID:",
      newDraft.id
    );

    return { draftId: newDraft.id };
  } catch (err: any) {
    console.error("❌ [generateRecipeDraftAction] DB create error:", err);
    return { error: "Failed to create DraftRecipe in DB. " + err.message };
  }
}
