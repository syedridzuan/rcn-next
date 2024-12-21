import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Clock, Users, ChefHat, Calendar, Tag } from 'lucide-react'
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { absoluteUrl, formatDate } from "@/lib/utils"

import { PrintButton } from "@/components/recipes/print-button"
import { RecipeMetaCards } from "./recipe-meta-cards"
import { RecipeSections } from '@/components/RecipeSections'
import { RecipeTips } from "@/components/RecipeTips"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { use } from 'react'
import { SaveRecipeButton } from "./SaveRecipeButton"
import { auth } from "@/auth"
import { Suspense } from "react"
import { CommentsWrapper } from "@/components/comments/comments-wrapper"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getRecipe(slug: string) {
  const session = await auth()
  
  const recipe = await prisma.recipe.findUnique({
    where: {
      slug,
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
      tips: true,
      comments: {
        where: {
          status: "APPROVED"
        },
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
      images: true,
      tags: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      savedBy: session?.user?.id ? {
        where: {
          userId: session.user.id
        },
        select: {
          id: true,
          notes: true,
        },
        take: 1,
      } : undefined,
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
  const resolvedParams = await Promise.resolve(params)
  const recipe = await getRecipe(resolvedParams.slug)

  if (!recipe) {
    return {
      title: "Resepi Tidak Dijumpai",
    }
  }

  const url = absoluteUrl(`/resepi/${recipe.slug}`)

  return {
    title: `${recipe.title} - Resepi`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description || undefined,
      type: "article",
      url,
      images: recipe.image ? [recipe.image] : [],
      locale: "ms_MY",
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description || undefined,
    },
  }
}

export default async function ResepePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const recipe = await getRecipe(resolvedParams.slug)

  if (!recipe) {
    notFound()
  }

  const url = absoluteUrl(`/resepi/${recipe.slug}`)
  
  // Get primary image or first image as fallback
  const primaryImage = recipe.images.find(img => img.isPrimary) || recipe.images[0]

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: primaryImage?.url,
    author: {
      "@type": "Person",
      name: recipe.user?.name || "Anonymous",
    },
    datePublished: recipe.createdAt.toISOString(),
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.totalTime || (recipe.prepTime + recipe.cookTime)}M`,
    recipeYield: recipe.servings,
    recipeCategory: recipe.category?.name,
    recipeCuisine: "Malaysian",
    recipeIngredient: recipe.sections
      ?.filter((section: any) => section.type === "INGREDIENTS")
      ?.flatMap((section: any) => 
        section.items.map((item: any) => item.content)
      ) || [],
    recipeInstructions: recipe.sections
      ?.filter((section: any) => section.type === "INSTRUCTIONS")
      ?.flatMap((section: any) => 
        section.items.map((item: any, index: number) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: item.content,
        }))
      ) || [],
  }

  const difficultyTranslations: { [key: string]: string } = {
    EASY: "Mudah",
    MEDIUM: "Sederhana",
    HARD: "Sukar",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          ...structuredData,
          image: primaryImage?.url || '',
        })} }
      />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Recipe Header */}
        <header className="mb-8">
          {primaryImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={100}
            />
            </div>
          ) : null}

          {/* Optional: Image Gallery */}
          {recipe.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              {recipe.images.map((image) => (
                <div 
                  key={image.id} 
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    image.isPrimary ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                </div>
              ))}
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
            <div 
              className="text-gray-600 text-lg" 
              dangerouslySetInnerHTML={{ 
                __html: recipe.description.replace(/<\/p>/g, '</p>&nbsp;') 
              }} 
            />
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
                  <p className="text-sm text-gray-500">Dikongsi oleh</p>
                  <p className="font-medium">{recipe.user.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <SaveRecipeButton 
                  recipeId={recipe.id}
                  savedRecipeId={recipe.savedBy?.[0]?.id}
                  existingNote={recipe.savedBy?.[0]?.notes}
                />
                <PrintButton label="Cetak Resepi" />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Diterbitkan pada {formatDate(recipe.createdAt)}
            </div>
          </div>
        </header>

        {/* Recipe Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <RecipeMetaCards
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            totalTime={recipe.totalTime}
            servings={recipe.servings}
            labels={{
              prepTime: "Masa Penyediaan",
              cookTime: "Masa Memasak",
              totalTime: "Jumlah Masa",
              servings: "Hidangan",
              minutes: "minit",
              people: "orang",
            }}
          />
        </div>

        {/* Tags Section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Link 
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Content */}
        <div className="space-y-8">
          <RecipeSections 
            sections={recipe.sections}
            labels={{
              ingredients: "Bahan-bahan",
              instructions: "Cara Memasak",
            }}
          />

          {/* Tips Section */}
          {recipe.tips && recipe.tips.length > 0 && (
        <section className="mt-8">
          <RecipeTips tips={recipe.tips} />
        </section>
      )}

          {/* Comments Section */}
          <section className="mt-12">
            <Suspense fallback={<div>Loading comments...</div>}>
              <CommentsWrapper 
                recipeId={recipe.id} 
                initialComments={recipe.comments}
              />
            </Suspense>
          </section>

        </div>
      </article>
    </>
  )
} 