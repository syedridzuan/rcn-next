import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecipeList from './recipe-list'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      difficulty: true,
      status: true,
      updatedAt: true,
      isEditorsPick: true,
      category: { select: { name: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link href="/dashboard/recipes/new">
          <Button>+ New Recipe</Button>
        </Link>
      </div>
      
      {/* The search input is removed from here and moved to the client component */}
      
      <RecipeList recipes={recipes} />
    </div>
  )
}
