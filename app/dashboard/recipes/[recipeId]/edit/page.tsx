import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { RecipeForm } from '@/components/dashboard/recipe-form'

interface PageProps {
  params: {
    recipeId: string
  }
}

async function getRecipe(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      sections: {
        include: {
          items: true
        }
      }
    }
  })

  if (!recipe) {
    return null
  }

  return {
    title: recipe.title,
    description: recipe.description || '',
    language: recipe.language,
    cookTime: recipe.cookTime,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    categoryId: recipe.categoryId,
    sections: recipe.sections.map(section => ({
      title: section.title,
      type: section.type,
      items: section.items.map(item => ({
        content: item.content
      }))
    }))
  }
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function EditRecipePage({ params }: PageProps) {
  const [recipe, categories] = await Promise.all([
    getRecipe(params.recipeId),
    getCategories()
  ])

  if (!recipe) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
        <RecipeForm 
          categories={categories}
          initialData={recipe}
          recipeId={params.recipeId}
        />
      </div>
    </div>
  )
} 