// app/tag/[slug]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Metadata } from "next"

// ---------- TYPES & CONSTANTS ----------

interface TagPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    sort?: string
    difficulty?: string
    // Add more filters as needed
  }
}

const ITEMS_PER_PAGE = 12

// ---------- METADATA (OPTIONAL) ----------

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })

  if (!tag) {
    return {}
  }

  return {
    title: `Tag: ${tag.name} | ResepiCheNom`,
    description: `Discover recipes related to ${tag.name}`,
  }
}

// ---------- SERVER-SIDE FETCHING ----------

async function getTagData(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      recipes: {
        include: {
          images: {
            where: { isPrimary: true },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      // If you store an image or banner for the tag, select it here
    },
  })

  return tag
}

// You could add your filtering/sorting logic here or in the client.
async function filterAndSortRecipes(
  recipes: any[],
  sort?: string,
  difficulty?: string
) {
  let filtered = [...recipes]

  // Optional: filter by difficulty
  if (difficulty) {
    filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
  }

  // Optional: sort
  switch (sort) {
    case "latest":
      filtered.sort(
        (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()
      )
      break
    case "popular":
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
    case "alphabetical":
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      // no sorting
      break
  }

  return filtered
}

// ---------- PAGE COMPONENT ----------

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = params
  const page = Number(searchParams.page) || 1
  const sort = searchParams.sort
  const difficulty = searchParams.difficulty
  const skip = (page - 1) * ITEMS_PER_PAGE

  const tag = await getTagData(slug)

  if (!tag) {
    notFound()
  }

  // Filter & sort on the server side (can be done client-side, too)
  const processedRecipes = await filterAndSortRecipes(
    tag.recipes,
    sort,
    difficulty
  )

  const totalRecipes = processedRecipes.length
  const totalPages = Math.ceil(totalRecipes / ITEMS_PER_PAGE)
  const paginatedRecipes = processedRecipes.slice(skip, skip + ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* HERO / HEADER SECTION */}
      <section className="mb-8 text-center">
        {/* If you have a banner or tag image, display it here */}
        {/* Example:
        {tag.image && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={tag.image}
              alt={tag.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
        )}
        */}
        <h1 className="text-4xl font-bold mb-2">{tag.name}</h1>
        <p className="text-gray-600">
          {totalRecipes} Resipi Ditandakan “{tag.name}”
        </p>
        <Separator className="my-4 mx-auto w-full max-w-lg" />
      </section>

      {/* FILTER & SORT SECTION (OPTIONAL) */}
      <section className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span>Sort By:</span>
          {/* Example sorting links or use <select>... */}
          <Link
            className={`px-3 py-1 rounded border ${
              sort === "latest"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?sort=latest`}
          >
            Latest
          </Link>
          <Link
            className={`px-3 py-1 rounded border ${
              sort === "popular"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?sort=popular`}
          >
            Popular
          </Link>
          <Link
            className={`px-3 py-1 rounded border ${
              sort === "alphabetical"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?sort=alphabetical`}
          >
            A-Z
          </Link>
        </div>
        {/* Example Difficulty Filter */}
        <div className="flex gap-2 items-center">
          <span>Difficulty:</span>
          <Link
            className={`px-3 py-1 rounded border ${
              !difficulty
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}${sort ? `?sort=${sort}` : ""}`}
          >
            All
          </Link>
          <Link
            className={`px-3 py-1 rounded border ${
              difficulty === "easy"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?difficulty=easy${sort ? `&sort=${sort}` : ""}`}
          >
            Easy
          </Link>
          <Link
            className={`px-3 py-1 rounded border ${
              difficulty === "medium"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?difficulty=medium${
              sort ? `&sort=${sort}` : ""
            }`}
          >
            Medium
          </Link>
          <Link
            className={`px-3 py-1 rounded border ${
              difficulty === "hard"
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "border-gray-300 text-gray-600"
            }`}
            href={`/tag/${slug}?difficulty=hard${sort ? `&sort=${sort}` : ""}`}
          >
            Hard
          </Link>
        </div>
      </section>

      {/* RECIPE GRID / LIST */}
      <section className="mb-8">
        {paginatedRecipes.length === 0 ? (
          <div className="text-center text-gray-500">
            No recipes found for this tag.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRecipes.map((recipe: any) => (
              <Link key={recipe.id} href={`/resepi/${recipe.slug}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                  <div className="relative aspect-video">
                    {recipe.images?.[0] && (
                      <Image
                        src={recipe.images[0].mediumUrl || recipe.images[0].url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {recipe.shortDescription || "Tiada ringkasan disediakan."}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {recipe.category?.name || "Tanpa Kategori"}
                      </span>
                      {/* Example: cookTime or popularity */}
                      <span>{(recipe.cookTime || 0) + (recipe.prepTime || 0)} minit</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PAGINATION (IF MANY RECIPES) */}
      {totalPages > 1 && (
        <section className="flex items-center justify-center gap-2 my-4">
          {page > 1 && (
            <Link href={`/tag/${slug}?page=${page - 1}${sort ? `&sort=${sort}` : ""}${difficulty ? `&difficulty=${difficulty}` : ""}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/tag/${slug}?page=${page + 1}${sort ? `&sort=${sort}` : ""}${difficulty ? `&difficulty=${difficulty}` : ""}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </section>
      )}

      {/* OPTIONAL: RELATED TAGS OR A “YOU MIGHT ALSO LIKE” SECTION */}

      {/* OPTIONAL: SEO / SHARING BUTTONS */}
      {/* e.g., <ShareButtons ... /> */}
    </div>
  )
}