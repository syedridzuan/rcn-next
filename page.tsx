import { Clock, Users, ChefHat } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/db"
import { CommentsWrapper } from "@/components/comments/comments-wrapper"
import { PrintButton } from "@/components/recipes/print-button"
import { ShareButton } from "./share-button"
import { RecipeMetaCards } from "./resepi-meta-cards"
import { RecipeSections } from "./resepi-sections"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { absoluteUrl } from "@/lib/utils"
import Image from "next/image"

interface PageProps {
  params: {
    slug: string
  }
}

async function getRecipe(slug: string) {
  const recipe = await prisma.recipe.findUnique({
    where: {
      slug,
      language: "ms", // Only get Malay recipes
    },
    include: {
      sections: {
        include: {
          items: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
      comments: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })

  if (!recipe) {
    return null
  }

  return recipe
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const recipe = await getRecipe(params.slug)

  if (!recipe) {
    return {
      title: "Resepi Tidak Dijumpai",
    }
  }

  const url = absoluteUrl(`/resepi/${recipe.slug}`)

  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description || undefined,
      type: "article",
      url,
      images: recipe.image ? [recipe.image] : [],
    },
  }
}

export default async function ResepePage({ params }: PageProps) {
  const recipe = await getRecipe(params.slug)

  if (!recipe) {
    notFound()
  }

  const url = absoluteUrl(`/resepi/${recipe.slug}`)

  const difficultyTranslations: { [key: string]: string } = {
    EASY: "Mudah",
    MEDIUM: "Sederhana",
    HARD: "Sukar",
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Recipe Header */}
      <header className="mb-8">
        {recipe.image && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Link 
              href={`/resepi/kategori/${recipe.category.slug}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {recipe.category.name}
            </Link>
            <span className="text-gray-400">•</span>
            <Badge variant="outline">
              {difficultyTranslations[recipe.difficulty]}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          
          {recipe.description && (
            <p className="text-gray-600 text-lg">{recipe.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {recipe.user.image && (
                <Image
                  src={recipe.user.image}
                  alt={recipe.user.name || ''}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-gray-500">Oleh</p>
                <p className="font-medium">{recipe.user.name}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <ShareButton url={url} title={recipe.title} />
              <PrintButton label="Cetak Resepi" />
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Meta Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <RecipeMetaCards
          prepTime={recipe.prepTime}
          cookTime={recipe.cookTime}
          servings={recipe.servings}
          labels={{
            prepTime: "Masa Penyediaan",
            cookTime: "Masa Memasak",
            servings: "Hidangan",
            minutes: "minit",
            people: "orang",
          }}
        />
      </div>

      {/* Recipe Sections */}
      <RecipeSections
        sections={recipe.sections}
        labels={{
          ingredients: "Bahan-bahan",
          instructions: "Cara Memasak",
        }}
      />

      {/* Comments Section */}
      <section className="mt-12 print:hidden">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Komen</h2>
          <span className="text-gray-500">({recipe._count.comments})</span>
        </div>
        <Separator className="my-4" />
        <CommentsWrapper 
          recipeId={recipe.id} 
          initialComments={recipe.comments}
        />
      </section>
    </article>
  )
}

