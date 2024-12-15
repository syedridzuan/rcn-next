"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Recipe {
  id: string
  title: string
  difficulty: string
  status: string
  updatedAt: Date
  category: {
    name: string
  } | null
}

interface RecipeListProps {
  recipes: Recipe[]
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter recipes based on the search query
  const filteredRecipes = recipes.filter((recipe) => {
    const q = searchQuery.toLowerCase()
    return (
      recipe.title.toLowerCase().includes(q) ||
      (recipe.category?.name.toLowerCase() || "").includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search recipes..."
          className="max-w-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Difficulty</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Updated At</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map(recipe => (
              <RecipeRow key={recipe.id} recipe={recipe} />
            ))}
            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No matching recipes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteRecipe(recipe.id)
        toast.success('Recipe deleted successfully')
        router.refresh()
      } catch {
        toast.error('Failed to delete recipe')
      }
    })
  }

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="p-3">{recipe.title}</td>
      <td className="p-3">{recipe.category?.name || '—'}</td>
      <td className="p-3">{recipe.difficulty}</td>
      <td className="p-3">{recipe.status}</td>
      <td className="p-3">{formatDate(recipe.updatedAt)}</td>
      <td className="p-3 text-right">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/dashboard/recipes/${recipe.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this recipe? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                  {isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  )
}
