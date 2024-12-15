import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { RecipeForm } from '@/components/dashboard/recipe-form'

interface EditRecipePageProps {
  params: {
    id: string
  }
}

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      sections: { include: { items: true } },
      tags: true,
      tips: true
    }
  })

  if (!recipe) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  
  const tags = ['Vegan', 'Italian', 'Quick', 'Gluten-Free']
  const selectedTags = recipe.tags.map(tag => tag.name) || []

  const initialData = {
    title: recipe.title,
    description: recipe.description || '',
    language: recipe.language || 'en',
    cookTime: recipe.cookTime,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    categoryId: recipe.categoryId,
    sections: recipe.sections.map(sec => ({
      title: sec.title,
      type: sec.type,
      items: sec.items.map(it => ({ content: it.content }))
    })),
    tips: recipe.tips.map(t => t.content),
    tags: selectedTags
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
        <RecipeForm
          categories={categories}
          tags={tags}
          initialData={initialData}
          recipeId={recipe.id}
        />
      </div>
    </div>
  )
}
