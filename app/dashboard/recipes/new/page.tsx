import { prisma } from '@/lib/db'
import { RecipeForm } from '@/components/dashboard/recipe-form'

export default async function NewRecipePage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        <RecipeForm categories={categories} />
      </div>
    </div>
  )
} 