import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import CategoryFilters from "./components/CategoryFilters";

interface PageProps {
  params: { slug: string };
  searchParams: {
    page?: string;
    difficulty?: string;
    sort?: string;
  };
}

const ITEMS_PER_PAGE = 12;

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {};
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const hasActiveSubscription = false;

  // 2. Determine pagination & filters
  const page = parseInt(searchParams.page || "1", 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const difficultyFilter = searchParams.difficulty?.toUpperCase();
  const sortParam = searchParams.sort;

  // 3. Build orderBy logic
  let orderBy: any = { createdAt: "desc" };
  if (sortParam === "cookTime") orderBy = { cookTime: "asc" };
  if (sortParam === "prepTime") orderBy = { prepTime: "asc" };

  // 4. Build whereClause logic for difficulty and published status
  const whereClause: any = {
    status: "PUBLISHED", // Only show published recipes
  };

  if (
    difficultyFilter &&
    ["EASY", "MEDIUM", "HARD", "EXPERT"].includes(difficultyFilter)
  ) {
    whereClause.difficulty = difficultyFilter;
  }

  // 5. Fetch the category and its recipes
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
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

  // 7. Calculate total pages
  const totalRecipes = category.recipesCount || category.recipes.length;
  const totalPages = Math.ceil(totalRecipes / ITEMS_PER_PAGE);

  if (page < 1 || (totalPages > 0 && page > totalPages)) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Kategori: {toTitleCase(category.name)}
      </h1>

      <CategoryFilters
        difficulty={difficultyFilter}
        sort={sortParam}
        slug={params.slug}
      />

      {category.recipes.length === 0 ? (
        <p className="text-gray-500">Maaf, tiada resipi buat masa ini.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.recipes.map((recipe) => {
            const primaryImage =
              recipe.images?.find((img) => img.isPrimary) ?? recipe.images?.[0];

            return (
              <Link key={recipe.id} href={`/resepi/${recipe.slug}`}>
                <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
                  {/* Members Only Badge */}
                  {recipe.membersOnly && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                      Premium
                    </div>
                  )}

                  {primaryImage && (
                    <div className="w-full h-48 relative">
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2 group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {recipe.shortDescription || "Tiada ringkasan resipi."}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        {page > 1 && (
          <Link
            href={`/kategori/${params.slug}?page=${page - 1}${
              difficultyFilter ? `&difficulty=${difficultyFilter}` : ""
            }${sortParam ? `&sort=${sortParam}` : ""}`}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Sebelum
          </Link>
        )}
        <span className="text-gray-700">
          Halaman {page} / {totalPages || 1}
        </span>
        {page < totalPages && (
          <Link
            href={`/kategori/${params.slug}?page=${page + 1}${
              difficultyFilter ? `&difficulty=${difficultyFilter}` : ""
            }${sortParam ? `&sort=${sortParam}` : ""}`}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Seterusnya
          </Link>
        )}
      </div>
    </div>
  );
}
