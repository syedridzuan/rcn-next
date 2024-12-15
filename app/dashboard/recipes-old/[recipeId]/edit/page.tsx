import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { RecipeForm } from '@/components/dashboard/recipe-form'

interface EditRecipePageProps {
  params: {
    recipeId: string
  }
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { recipeId } = await params

  const [recipe, categories] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    }),
    prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  ])

  if (!recipe) {
    notFound()
  }

  const initialData: RecipeFormData = {
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
        <RecipeForm 
          categories={categories}
          initialData={initialData}
          recipeId={recipeId}
        />
      </div>
    </div>
  )
} 