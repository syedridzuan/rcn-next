import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Shell } from "@/components/shell"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UnsaveRecipeButton } from "./UnsaveRecipeButton"
import { Clock, ChefHat, StickyNote, BookmarkIcon } from 'lucide-react'
import type { SavedRecipe } from "@/types"
import { EditNoteButton } from "./EditNoteButton"

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
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Saved Recipes</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your curated collection of favorite recipes.
            </p>
          </div>
          <BookmarkIcon className="h-8 w-8 text-primary" />
        </div>

        {savedRecipes.length === 0 ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground/60" />
              <h2 className="mt-4 text-xl font-semibold">Your recipe collection is empty</h2>
              <p className="mb-6 mt-2 text-muted-foreground">
                Start building your culinary journey by saving recipes you love or want to try.
              </p>
              <Button asChild size="lg">
                <Link href="/recipes">Explore Recipes</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map(({ recipe, id, notes }) => (
              <Card key={id} className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader className="border-b p-0">
                  {recipe.images[0] ? (
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={recipe.images[0].url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <ChefHat className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="grid gap-2.5 p-4">
                  <CardTitle className="line-clamp-1 text-lg">{recipe.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      {recipe.category.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.cookTime + recipe.prepTime} mins
                    </span>
                  </div>
                  {notes && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <StickyNote className="h-4 w-4" />
                          Your Notes
                        </div>
                        <EditNoteButton 
                          savedRecipeId={id}
                          initialNote={notes}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {notes}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/recipes/${recipe.slug}`}>
                      View Recipe
                    </Link>
                  </Button>
                  <UnsaveRecipeButton 
                    savedRecipeId={id}
                    className="shrink-0"
                    recipeName={recipe.title}
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

