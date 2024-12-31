import { prisma } from "@/lib/db";
import { RecipeForm } from "@/components/admin/recipe-form";

export default async function NewRecipePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Presume tags are predefined:
  const tags = ["Vegan", "Italian", "Quick", "Gluten-Free"];

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        <RecipeForm categories={categories} tags={tags} />
      </div>
    </div>
  );
}
