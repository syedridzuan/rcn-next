import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { RecipeForm } from "@/components/dashboard/recipe-form"

interface EditRecipePageProps {
  params: {
    recipeId: string
  }
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ recipeId: string }>
}) {
  const { recipeId } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      sections: { include: { items: true } },
      tags: true,
      tips: true,
    },
  })

  if (!recipe) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  })
  const allTagNames = allTags.map((tag) => tag.name)

  const selectedTags = recipe.tags.map((tag) => tag.name) || []

  const initialData = {
    title: recipe.title,
    description: recipe.description ?? "",
    shortDescription: recipe.shortDescription ?? "",
    language: recipe.language ?? "en",
    cookTime: recipe.cookTime,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    categoryId: recipe.categoryId,
    sections: recipe.sections.map((sec) => ({
      title: sec.title,
      type: sec.type,
      items: sec.items.map((it) => ({ content: it.content })),
    })),
    tips: recipe.tips.map((t) => t.content),
    // Convert array of selected tag strings to the form’s "tags" array
    tags: selectedTags,
    isEditorsPick: recipe.isEditorsPick,
  }

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
  )
}