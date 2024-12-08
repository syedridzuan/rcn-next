import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { CategoryFilters } from '@/components/categories/category-filters'
import { Metadata, ResolvingMetadata } from 'next'
import { absoluteUrl } from '@/lib/utils'

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
    difficulty?: string
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []
  
  return {
    title: `${category.name} Recipes - Your Recipe Site`,
    description: category.description || `Browse our collection of ${category.name.toLowerCase()} recipes`,
    openGraph: {
      title: `${category.name} Recipes`,
      description: category.description || `Discover delicious ${category.name.toLowerCase()} recipes`,
      images: category.image ? [category.image, ...previousImages] : previousImages,
      type: 'website',
      url: absoluteUrl(`/categories/${params.slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Recipes`,
      description: category.description || `Discover delicious ${category.name.toLowerCase()} recipes`,
      images: category.image ? [category.image] : [],
    },
  }
}

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      recipes: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      _count: {
        select: {
          recipes: true
        }
      }
    }
  })
}

async function getCategoryRecipes(
  categoryId: string,
  sort: string = 'newest',
  difficulty?: string
) {
  const orderBy = sort === 'newest' 
    ? { createdAt: 'desc' as const }
    : sort === 'cookTime' 
    ? { cookTime: 'asc' as const }
    : { title: 'asc' as const }

  return await prisma.recipe.findMany({
    where: {
      categoryId,
      ...(difficulty ? { difficulty } : {})
    },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    notFound()
  }

  const recipes = await getCategoryRecipes(
    category.id,
    searchParams.sort,
    searchParams.difficulty
  )

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Recipes`,
    description: category.description,
    url: absoluteUrl(`/categories/${params.slug}`),
    numberOfItems: category._count.recipes,
    itemListElement: recipes.map((recipe, index) => ({
      '@type': 'Recipe',
      '@id': absoluteUrl(`/recipes/${recipe.slug}`),
      name: recipe.title,
      description: recipe.description,
      image: recipe.image,
      author: {
        '@type': 'Person',
        name: recipe.user.name
      },
      cookTime: `PT${recipe.cookTime}M`,
      prepTime: `PT${recipe.prepTime}M`,
      position: index + 1
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {category.image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {category._count.recipes} {category._count.recipes === 1 ? 'recipe' : 'recipes'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <CategoryFilters 
          initialSort={searchParams.sort}
          initialDifficulty={searchParams.difficulty}
        />

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.slug}`}
              className="group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border border-gray-200"
            >
              <div className="aspect-video relative">
                {recipe.image ? (
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">
                    {recipe.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime + recipe.cookTime} mins</span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {recipe.title}
                </h2>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-2">
                  {recipe.user.image && (
                    <Image
                      src={recipe.user.image}
                      alt={recipe.user.name || ''}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-600">
                    {recipe.user.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found in this category.</p>
          </div>
        )}
      </div>
    </>
  )
} 