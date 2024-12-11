import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Shell } from "@/components/shell"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UnsaveRecipeButton } from "./UnsaveRecipeButton"
import { Clock, ChefHat } from "lucide-react"
import type { SavedRecipe } from "@/types"

export default async function SavedRecipesPage() {
  // Get current user session
  const session = await auth()
  
  // Redirect if not authenticated
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Fetch saved recipes with related data
  const savedRecipes = await prisma.savedRecipe.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      recipe: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Recipes</h1>
          <p className="text-muted-foreground">
            View and manage your saved recipes collection.
          </p>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <ChefHat className="h-10 w-10 text-muted-foreground/60" />
              <h2 className="mt-4 text-xl font-semibold">No saved recipes</h2>
              <p className="mb-4 mt-2 text-muted-foreground">
                You haven't saved any recipes yet. Browse recipes and click the save
                button to add them to your collection.
              </p>
              <Button asChild>
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map(({ recipe, id }) => (
              <Card key={id} className="overflow-hidden">
                <CardHeader className="border-b p-0">
                  {recipe.images[0] ? (
                    <div className="aspect-video relative">
                      <Image
                        src={recipe.images[0].url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted" />
                  )}
                </CardHeader>
                <CardContent className="grid gap-2.5 p-4">
                  <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{recipe.category.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.cookTime + recipe.prepTime} mins
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/recipes/${recipe.slug}`}>
                      View Recipe
                    </Link>
                  </Button>
                  <UnsaveRecipeButton 
                    savedRecipeId={id}
                    className="shrink-0"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  )
} 