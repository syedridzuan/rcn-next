/* --------------------------------------------
   app/(main)/(ads-enabled)/resepi/cari/page.tsx
--------------------------------------------- */
import type { RecipeDifficulty } from "@prisma/client";
import { auth } from "@/auth"; // e.g., your NextAuth server function or custom auth
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { highlightSnippet } from "@/utils/highlightSnippet";

import LiveSearch from "./components/LiveSearch";

export const dynamic = "force-dynamic";

/**
 * Bentuk querystring. Next.js 15 menjadikan `searchParams` sebagai 'promise'
 * di dalam server components.
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
  // 1. Dapatkan query param secara async
  const searchParams = await promised;

  const keyword = (searchParams.keyword ?? "").trim();
  let pageNum = parseInt(searchParams.page ?? "1", 10);
  if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

  const difficultyFilter = (searchParams.difficulty ?? "").trim().toUpperCase();
  const categoryIdFilter = (searchParams.categoryId ?? "").trim();

  // 2. Buat pagination asas
  const PAGE_SIZE = 10;
  const skip = (pageNum - 1) * PAGE_SIZE;
  const take = PAGE_SIZE;

  // 3. Buat syarat 'where' untuk Prisma
  const whereCondition: any = { status: "PUBLISHED" };

  // Jika ada keyword => cari di title / shortDescription
  if (keyword) {
    whereCondition.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { shortDescription: { contains: keyword, mode: "insensitive" } },
    ];
  }

  // Jika difficulty valid
  const validDifficulties: RecipeDifficulty[] = [
    "EASY",
    "MEDIUM",
    "HARD",
    "EXPERT",
  ];
  if (validDifficulties.includes(difficultyFilter as RecipeDifficulty)) {
    whereCondition.difficulty = difficultyFilter;
  }

  // Jika ada categoryId
  if (categoryIdFilter) {
    whereCondition.categoryId = categoryIdFilter;
  }

  // 4. Semak langganan user (untuk lihat resepi baru)
  //    - Contoh: check NextAuth session + db subscription
  const session = await auth();
  let userHasActiveSub = false;
  if (session?.user?.id) {
    // Contoh: semak subscription
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });
    userHasActiveSub = !!activeSub;
  }

  // 5. Dapatkan senarai categories, recipes, totalCount
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
        createdAt: true,
        membersOnly: true,
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

  // 6. Filter recipes based on subscription status
  const filteredRecipes = recipes.filter((r) => {
    if (r.membersOnly && !userHasActiveSub) {
      // Hide members-only recipes from non-subscribers
      return false;
    }
    return true;
  });

  // 7. Kira total pages, tapi kita mungkin buat sekadar paparan semasa
  //    (Jika nak pagination betul-betul, kena kira semula)
  const visibleCount = filteredRecipes.length;
  // totalPages = (in-memory) => Math.ceil(visibleCount / PAGE_SIZE)
  // Dalam snippet ini, kita kekal totalPages dari DB untuk ringkas
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 8. Bina fungsi pagination link
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

      {/* Borang carian (server side) */}
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

      {/* Komponen carian langsung (debounced) */}
      <div className="mb-6">
        <LiveSearch />
      </div>

      <Separator className="mb-4" />

      <p className="text-sm text-gray-600 mb-2">
        Menunjukkan {filteredRecipes.length} resepi daripada {totalCount} total
        {userHasActiveSub ? " (Langganan aktif)" : ""}
      </p>

      {/* Senarai resepi */}
      {filteredRecipes.length < 1 ? (
        <p className="text-red-600 font-medium">
          Tiada resepi ditemui atau resepi baru memerlukan langganan.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredRecipes.map((recipe) => {
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
                  {recipe.membersOnly && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      Ahli Sahaja
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
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
