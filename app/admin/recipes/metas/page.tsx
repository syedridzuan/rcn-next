// app/admin/recipes/metas/page.tsx
import { prisma } from "@/lib/db";
import { RecipeMetaAdmin } from "./RecipeMetaAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Metas | Admin",
};

export default async function AdminRecipeMetasPage() {
  // 1) Fetch categories
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // 2) Also fetch your recipes
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      cookTime: true,
      prepTime: true,
      totalTime: true,
      servings: true,
      servingType: true,
      difficulty: true,
      status: true,
      categoryId: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Recipe Meta</h1>
      <RecipeMetaAdmin
        initialRecipes={recipes}
        categories={categories} // pass the array here
      />
    </div>
  );
}
