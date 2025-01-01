/* --------------------------------------------
   app/(main)/(ads-enabled)/resepi/cari/page.tsx
--------------------------------------------- */

import type { RecipeDifficulty } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { highlightSnippet } from "@/utils/highlightSnippet";

// Import your LiveSearch client component
import LiveSearch from "./components/LiveSearch";

export const dynamic = "force-dynamic";

/**
 * The shape of your querystring. Next.js 15 treats
 * `searchParams` as a promise in server components.
 */
interface SearchParams {
  keyword?: string;
  page?: string;
  difficulty?: string;
  categoryId?: string;
}

interface SearchRecipesPageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams: promised,
}: SearchRecipesPageProps) {
  const { keyword = "" } = await promised;
  return {
    title: keyword ? `Cari Resepi: ${keyword}` : "Cari Resepi",
  };
}

export default async function SearchRecipesPage({
  searchParams: promised,
}: SearchRecipesPageProps) {
  const searchParams = await promised;

  // Extract search parameters safely
  const keyword = (searchParams.keyword ?? "").trim();
  let pageNum = parseInt(searchParams.page ?? "1", 10);
  if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

  const difficultyFilter = (searchParams.difficulty ?? "").trim().toUpperCase();
  const categoryIdFilter = (searchParams.categoryId ?? "").trim();

  // Basic pagination
  const PAGE_SIZE = 10;
  const skip = (pageNum - 1) * PAGE_SIZE;
  const take = PAGE_SIZE;

  // Prisma 'where' condition
  const whereCondition: any = { status: "PUBLISHED" };

  // Keyword-based filtering on title OR shortDescription
  if (keyword) {
    whereCondition.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { shortDescription: { contains: keyword, mode: "insensitive" } },
    ];
  }

  // Advanced filter: difficulty
  const validDifficulties: RecipeDifficulty[] = [
    "EASY",
    "MEDIUM",
    "HARD",
    "EXPERT",
  ];
  if (validDifficulties.includes(difficultyFilter as RecipeDifficulty)) {
    whereCondition.difficulty = difficultyFilter;
  }

  // Advanced filter: category
  if (categoryIdFilter) {
    whereCondition.categoryId = categoryIdFilter;
  }

  // Fetch categories + recipes + totalCount in parallel
  const [categories, recipes, totalCount] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.recipe.findMany({
      where: whereCondition,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        images: {
          where: { isPrimary: true },
          select: { url: true, thumbnailUrl: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
        difficulty: true,
      },
    }),
    prisma.recipe.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Build pagination URLs
  function buildPageUrl(target: number) {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (difficultyFilter) params.set("difficulty", difficultyFilter);
    if (categoryIdFilter) params.set("categoryId", categoryIdFilter);
    params.set("page", String(target));

    return `/resepi/cari?${params.toString()}`;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Carian Resepi</h1>

      {/** Server-side search form */}
      <form method="GET" className="flex flex-wrap items-center gap-2 mb-6">
        <Input
          type="text"
          name="keyword"
          placeholder="Cari resepi..."
          defaultValue={keyword}
          className="max-w-sm"
        />

        <select
          name="difficulty"
          defaultValue={difficultyFilter}
          className="border rounded px-3 py-1.5"
        >
          <option value="">Semua Kesukaran</option>
          <option value="EASY">Mudah</option>
          <option value="MEDIUM">Sederhana</option>
          <option value="HARD">Sukar</option>
          <option value="EXPERT">Pakar</option>
        </select>

        <select
          name="categoryId"
          defaultValue={categoryIdFilter}
          className="border rounded px-3 py-1.5"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button type="submit" variant="default">
          Cari
        </Button>
      </form>

      {/** LiveSearch for debounced searching */}
      <div className="mb-6">
        <LiveSearch />
      </div>

      <Separator className="mb-4" />

      <p className="text-sm text-gray-600 mb-2">
        Menunjukkan {recipes.length} resepi daripada {totalCount} total
      </p>

      {recipes.length < 1 ? (
        <p className="text-red-600 font-medium">
          Tiada resepi ditemui untuk carian ini.
        </p>
      ) : (
        <div className="grid gap-4">
          {recipes.map((recipe) => {
            const primaryImage = recipe.images?.[0];
            const shortDescHighlighted = highlightSnippet(
              recipe.shortDescription ?? "",
              keyword
            );

            return (
              <div
                key={recipe.id}
                className="p-4 border rounded-md bg-white hover:shadow transition"
              >
                <a
                  href={`/resepi/${recipe.slug}`}
                  className="text-lg font-semibold block"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightSnippet(recipe.title, keyword),
                    }}
                  />
                </a>

                <p
                  className="text-sm text-gray-600 mt-1"
                  dangerouslySetInnerHTML={{ __html: shortDescHighlighted }}
                />

                <div className="mt-2 flex items-center gap-2">
                  {recipe.category && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {recipe.category.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-medium">
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/** Pagination controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button variant="outline" disabled={pageNum <= 1} asChild>
          <a href={buildPageUrl(pageNum - 1)}>Sebelum</a>
        </Button>

        <span className="text-sm text-gray-700">
          Halaman {pageNum} / {totalPages || 1}
        </span>

        <Button variant="outline" disabled={pageNum >= totalPages} asChild>
          <a href={buildPageUrl(pageNum + 1)}>Seterusnya</a>
        </Button>
      </div>
    </main>
  );
}
