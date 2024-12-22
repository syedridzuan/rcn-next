import { notFound } from "next/navigation"
import { RecipeCreateForm } from "./recipe-create-form"
import { prisma } from "@/lib/db"

// Optional: fetch categories/tags if needed from DB to pass as props
export default async function RecipeCreatePage() {
  // E.g., fetch categories to show in a <select>
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
      <RecipeCreateForm categories={categories} />
    </div>
  )
}