import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import CategoryFilters from "./components/CategoryFilters";
import { formatDate } from "@/lib/utils"; // We'll use this for publishedAt
// If you don't have a formatDate function, just replace with your own date logic.

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    difficulty?: string;
    sort?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

const difficultyTranslations: Record<string, string> = {
  EASY: "Mudah",
  MEDIUM: "Sederhana",
  HARD: "Sukar",
  EXPERT: "Pakar",
};

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

export async function generateMetadata(_: PageProps): Promise<Metadata> {
  // You can dynamically build metadata if needed.
  return {};
}

/**
 * This page shows only recipes with `status = "PUBLISHED"`,
 * by default ordered by `publishedAt DESC`,
 * but user can switch to sort by `cookTime` or `prepTime`.
 * Also includes optional fields for a richer UI.
 */
export default async function CategoryPage({
  params: promisedParams,
  searchParams: promisedSearchParams,
}: PageProps) {
  // 1) Await the route params & searchParams (Next.js 15 quirk)
  const { slug } = await promisedParams;
  const { page = "1", difficulty, sort } = await promisedSearchParams;

  // 2) Convert page to number for pagination
  const pageNum = parseInt(page, 10) || 1;
  const skip = (pageNum - 1) * ITEMS_PER_PAGE;

  // 3) Build difficulty filter
  const difficultyFilter = difficulty?.toUpperCase();
  // 4) Build orderBy logic
  let orderBy: any = { publishedAt: "desc" };
  if (sort === "cookTime") orderBy = { cookTime: "asc" };
  if (sort === "prepTime") orderBy = { prepTime: "asc" };

  // 5) Only published
  const whereClause: any = {
    status: "PUBLISHED",
  };
  // If user selected a valid difficulty
  if (
    difficultyFilter &&
    ["EASY", "MEDIUM", "HARD", "EXPERT"].includes(difficultyFilter)
  ) {
    whereClause.difficulty = difficultyFilter;
  }

  // 6) Fetch the category + associated PUBLISHED recipes
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      recipes: {
        where: whereClause,
        include: {
          user: { select: { name: true, image: true } },
          tags: true,
          images: true,
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      },
    },
  });

  if (!category) {
    notFound();
  }

  // 7) If your Category model tracks only published recipesCount, we can use that:
  const totalRecipes = category.recipesCount || category.recipes.length;
  const totalPages = Math.ceil(totalRecipes / ITEMS_PER_PAGE);

  // 8) If the requested page is out of range, show 404
  if (pageNum < 1 || (totalPages > 0 && pageNum > totalPages)) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Kategori: {toTitleCase(category.name)}
      </h1>

      <CategoryFilters difficulty={difficultyFilter} sort={sort} slug={slug} />

      {category.recipes.length === 0 ? (
        <p className="text-gray-500">Maaf, tiada resipi buat masa ini.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.recipes.map((recipe) => {
            const primaryImage =
              recipe.images?.find((img) => img.isPrimary) ?? recipe.images?.[0];

            return (
              <Link key={recipe.id} href={`/resepi/${recipe.slug}`}>
                <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative p-0">
                  {/* 7) “Members Only” Marker */}
                  {recipe.membersOnly && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                      Premium
                    </span>
                  )}

                  {/* If an image is found, display it */}
                  {primaryImage && (
                    <div className="w-full h-44 relative">
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Content below the image */}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </h2>

                    {/* 1) Published Date */}
                    {recipe.publishedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Diterbitkan pada{" "}
                        {formatDate(recipe.publishedAt, { time: false })}
                      </p>
                    )}

                    {/* 2) Difficulty Badge */}
                    <div className="mt-1">
                      <span className="inline-block text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-600 rounded">
                        {difficultyTranslations[recipe.difficulty] ||
                          recipe.difficulty}
                      </span>
                    </div>

                    {/* 3) Cook/Prep Time */}
                    <p className="text-sm text-gray-500 mt-1">
                      {recipe.prepTime} min penyediaan • {recipe.cookTime} min
                      memasak
                    </p>

                    {/* 4) Author Name / Image */}
                    {recipe.user && (
                      <div className="flex items-center gap-2 mt-2">
                        {recipe.user.image && (
                          <Image
                            src={recipe.user.image}
                            alt={recipe.user.name ?? ""}
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                          />
                        )}
                        <p className="text-xs text-gray-500">
                          Oleh {recipe.user.name}
                        </p>
                      </div>
                    )}

                    {/* 5) View Count or Like Count */}
                    <p className="text-xs text-gray-500 mt-1">
                      {recipe.viewCount ?? 0} paparan • {recipe.likeCount ?? 0}{" "}
                      suka
                    </p>

                    {/* 6) Tags */}
                    {recipe.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* shortDescription (brief excerpt) */}
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {recipe.shortDescription || "Tiada ringkasan resipi."}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Simple Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        {/* Previous Page */}
        {pageNum > 1 && (
          <Link
            href={`/kategori/${slug}?page=${pageNum - 1}${
              difficultyFilter ? `&difficulty=${difficultyFilter}` : ""
            }${sort ? `&sort=${sort}` : ""}`}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Sebelum
          </Link>
        )}

        <span className="text-gray-700">
          Halaman {pageNum} / {totalPages || 1}
        </span>

        {/* Next Page */}
        {pageNum < totalPages && (
          <Link
            href={`/kategori/${slug}?page=${pageNum + 1}${
              difficultyFilter ? `&difficulty=${difficultyFilter}` : ""
            }${sort ? `&sort=${sort}` : ""}`}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Seterusnya
          </Link>
        )}
      </div>
    </div>
  );
}
