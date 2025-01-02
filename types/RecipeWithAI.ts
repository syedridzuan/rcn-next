// types/RecipeWithAI.ts
import { Recipe } from "@prisma/client";

export type RecipeWithAI = Pick<
  Recipe,
  | "id"
  | "title"
  | "prepTime"
  | "cookTime"
  | "totalTime"
  | "difficulty"
  | "tags"
  | "servingType"
  | "openaiPrepTime"
  | "openaiCookTime"
  | "openaiTotalTime"
  | "openaiDifficulty"
  | "openaiTags"
  | "openaiServingType"
>;
