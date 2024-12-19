import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { cookies } from 'next/headers' // If needed for session or other logic
import CategoryFilters from './components/CategoryFilters'

interface PageProps {
  params: { slug: string }
  searchParams: {
    page?: string
    difficulty?: string
    sort?: string
  }
}

const ITEMS_PER_PAGE = 10;
const PAGE_RANGE = 2;

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
    select: { name: true, description: true }
  })

  if (!category) {
    return {
      title: 'Kategori Tidak Dijumpai',
      description: 'Kategori yang anda cari tidak dijumpai.'
    }
  }

  const page = parseInt(resolvedSearchParams.page || '1', 10)
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/kategori/${resolvedParams.slug}`
  
  let robots = undefined
  if (page > 1) {
    // For subsequent pages, optional noindex
    robots = { index: false, follow: true }
  }

  return {
    title: `${toTitleCase(category.name)} - ResepiCheNom`,
    description: category.description || `Terokai resipi lazat dalam kategori ${category.name}.`,
    openGraph: {
      title: category.name,
      description: category.description || `Terokai resipi lazat dalam kategori ${category.name}.`,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: category.description || `Terokai resipi lazat dalam kategori ${category.name}.`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Filters & Sorting
  const difficultyFilter = resolvedSearchParams.difficulty && resolvedSearchParams.difficulty.toUpperCase();
  const sortParam = resolvedSearchParams.sort;
  let orderBy: any = { createdAt: 'desc' }
  if (sortParam === 'cookTime') orderBy = { cookTime: 'asc' }
  if (sortParam === 'prepTime') orderBy = { prepTime: 'asc' }

  // Where clause for difficulty if provided
  const whereClause: any = {}
  if (difficultyFilter && ['EASY','MEDIUM','HARD','EXPERT'].includes(difficultyFilter)) {
    whereClause.difficulty = difficultyFilter
  }

  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      recipes: {
        where: whereClause,
        include: {
          user: {
            select: { name: true, image: true },
          },
          tags: true,
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      },
    },
  })

  if (!category) {
    notFound()
  }

  const totalRecipes = category.recipesCount
  const totalPages = Math.ceil(totalRecipes / ITEMS_PER_PAGE);

  if (page < 1 || (totalPages > 0 && page > totalPages)) {
    notFound()
  }

  // Fetch Editor’s Pick recipes for this category (just the first 1-2)
  const editorsPicks = await prisma.recipe.findMany({
    where: {
      categoryId: category.id,
      isEditorsPick: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
    include: {
      user: { select: { name: true, image: true } },
      tags: true,
    }
  })

  // Structured data for SEO (CollectionPage + Breadcrumb)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/kategori/${resolvedParams.slug}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Laman Utama",
          "item": `${process.env.NEXT_PUBLIC_APP_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kategori",
          "item": `${process.env.NEXT_PUBLIC_APP_URL}/kategori`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `${process.env.NEXT_PUBLIC_APP_URL}/kategori/${resolvedParams.slug}`
        }
      ]
    }
  }

  // Create a function for pagination with ellipses
  function getPaginationPages(current: number, total: number): Array<number | string> {
    const pages: Array<number | string> = []
    pages.push(1)
    if (current > PAGE_RANGE + 2) pages.push('...')
    for (let i = Math.max(2, current - PAGE_RANGE); i <= Math.min(total - 1, current + PAGE_RANGE); i++) {
      pages.push(i)
    }
    if (current < total - (PAGE_RANGE + 1)) pages.push('...')
    if (total > 1) pages.push(total)
    return pages
  }

  const pagesArray = getPaginationPages(page, totalPages)

  async function copyShareLink() {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href)
      alert('URL disalin!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {page > 1 && (
        <meta name="robots" content="noindex,follow" />
      )}

      {/* Hero Section */}
      {category.image && (
        <div className="relative mb-8">
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <Image
              src={category.image}
              alt={`Imej kategori ${category.name}`}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-white">
            <h1 className="text-3xl font-bold">{toTitleCase(category.name)}</h1>
            {category.description && (
              <p className="text-sm mt-2">{category.description}</p>
            )}
            {totalRecipes > 0 && (
              <p className="text-sm mt-1">
                {totalRecipes} resipi dalam kategori ini.
              </p>
            )}
          </div>
        </div>
      )}

      {!category.image && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{toTitleCase(category.name)}</h1>
          {category.description && (
            <p className="text-gray-700">
              {category.description}
            </p>
          )}
          {totalRecipes > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {totalRecipes} resipi dalam kategori ini.
            </p>
          )}
        </div>
      )}

      {/* Editor’s Pick Section */}
      {editorsPicks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pilihan Editor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editorsPicks.map((recipe) => (
              <Link key={recipe.id} href={`/resepi/${recipe.slug}`}>
                <div className="border rounded-lg hover:shadow-lg transition-shadow overflow-hidden group">
                  {recipe.images?.[0]?.url && (
                    <div className="relative aspect-video">
                      <Image
                        src={recipe.images[0].url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      {recipe.user.image && (
                        <Image
                          src={recipe.user.image}
                          alt={recipe.user.name || ''}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-600">{recipe.user.name}</span>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                        {recipe.tags.map(tag => (
                          <span key={tag.id} className="underline hover:text-blue-800">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Replace the filters section with the new component */}
      <CategoryFilters 
        difficulty={resolvedSearchParams.difficulty} 
        sort={resolvedSearchParams.sort}
        slug={resolvedParams.slug}
      />

      {/* Recipe Grid */}
      {category.recipes.length === 0 ? (
        <p className="text-gray-500">Maaf, tiada resipi buat masa ini.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.recipes.map((recipe) => (
            <Link key={recipe.id} href={`/resepi/${recipe.slug}`}>
              <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.images?.[0]?.url ? (
                  <div className="aspect-video relative">
                    <Image
                      src={recipe.images[0].url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Tiada gambar</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h2>
                  {recipe.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {recipe.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {recipe.user.image && (
                      <Image
                        src={recipe.user.image}
                        alt={recipe.user.name || ''}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-600">{recipe.user.name}</span>
                  </div>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                      {recipe.tags.map(tag => (
                        <span key={tag.id} className="underline hover:text-blue-800">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-8 space-y-4">
          <p>Halaman {page} daripada {totalPages}</p>
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Link
              href={`/kategori/${resolvedParams.slug}?${new URLSearchParams({
                ...resolvedSearchParams,
                page: (page - 1).toString()
              })}`}
              className={`px-3 py-2 rounded border text-sm ${
                page <= 1 
                  ? 'text-gray-400 border-gray-200 pointer-events-none' 
                  : 'hover:bg-orange-50 hover:border-orange-200 text-gray-600 border-gray-300'
              }`}
            >
              Sebelumnya
            </Link>

            {/* Page Numbers with ellipses */}
            {pagesArray.map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-gray-400">
                    ...
                  </span>
                )
              } else {
                return (
                  <Link
                    key={`page-${p}`}
                    href={`/kategori/${resolvedParams.slug}?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: p.toString()
                    })}`}
                    className={`px-3 py-2 rounded border text-sm ${
                      p === page 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'hover:bg-orange-50 hover:border-orange-200 text-gray-600 border-gray-300'
                    }`}
                  >
                    {p}
                  </Link>
                )
              }
            })}

            {/* Next Button */}
            <Link
              href={`/kategori/${resolvedParams.slug}?${new URLSearchParams({
                ...resolvedSearchParams,
                page: (page + 1).toString()
              })}`}
              className={`px-3 py-2 rounded border text-sm ${
                page >= totalPages 
                  ? 'text-gray-400 border-gray-200 pointer-events-none' 
                  : 'hover:bg-orange-50 hover:border-orange-200 text-gray-600 border-gray-300'
              }`}
            >
              Seterusnya
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}