// File: app/admin/recipes/[recipeId]/edit/page.tsx

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/admin/recipe-form";
import type { RecipeDifficulty, RecipeStatus } from "@prisma/client";

/**
 * Next.js 15: dynamic route param is a Promise, so we define:
 *   interface PageProps { params: Promise<{ recipeId: string }> }
 */
interface PageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function EditRecipePage({ params: promised }: PageProps) {
  // 1) Await the route param
  const { recipeId } = await promised;

  // 2) Fetch the recipe
  //    Include sections, tips, tags, etc. as needed
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      sections: { include: { items: true } },
      tips: true,
      tags: true,
    },
  });
  if (!recipe) {
    notFound();
  }

  // 3) Fetch categories & tags for the form
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  const allTagNames = allTags.map((tag) => tag.name);
  const selectedTags = recipe.tags.map((tag) => tag.name) || [];

  // 4) Build initialData for the form
  //    Convert any `null` int fields to empty string => user sees blank
  //    Convert text fields with `?? ""` => user sees empty if null
  const initialData = {
    title: recipe.title,
    description: recipe.description ?? "",
    shortDescription: recipe.shortDescription ?? "",
    language: recipe.language ?? "en",
    status: recipe.status as RecipeStatus, // DRAFT, PUBLISHED, etc.
    difficulty: recipe.difficulty as RecipeDifficulty, // EASY, MEDIUM, etc.

    // integer columns => toString() if not null
    cookTime: recipe.cookTime !== null ? recipe.cookTime.toString() : "",
    CookTimeText: recipe.CookTimeText ?? "",
    prepTime: recipe.prepTime !== null ? recipe.prepTime.toString() : "",
    PrepTimeText: recipe.PrepTimeText ?? "",
    totalTime: recipe.totalTime !== null ? recipe.totalTime.toString() : "",
    TotalTimeText: recipe.TotalTimeText ?? "",
    servings: recipe.servings !== null ? recipe.servings.toString() : "",
    servingsText: recipe.servingsText ?? "",

    // new boolean column
    membersOnly: recipe.membersOnly ?? false,

    // category
    categoryId: recipe.categoryId ?? "",

    // sections => transform for use in field arrays
    sections: recipe.sections.map((sec) => ({
      title: sec.title,
      type: sec.type, // "INGREDIENTS" or "INSTRUCTIONS"
      items: sec.items.map((it) => ({ content: it.content })),
    })),

    // tips => array of strings
    tips: recipe.tips.map((t) => t.content),
    // tags => array of strings
    tags: selectedTags,

    // example of other fields
    isEditorsPick: recipe.isEditorsPick,
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>

        <RecipeForm
          categories={categories}
          allTagSuggestions={allTagNames}
          initialData={initialData}
          recipeId={recipe.id}
        />
      </div>
    </div>
  );
}
