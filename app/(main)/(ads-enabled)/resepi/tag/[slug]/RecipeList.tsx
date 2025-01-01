"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecipeImageLite {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface RecipeLite {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  images?: RecipeImageLite[]; // <-- minimal fields for images
}

interface RecipeListProps {
  recipes: RecipeLite[];
  tagSlug: string;
  currentPage: number;
  totalPages: number;
}

export function RecipeList({
  recipes,
  tagSlug,
  currentPage,
  totalPages,
}: RecipeListProps) {
  // If needed: page size, e.g. 10

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Resepi dengan tag: <Badge>{tagSlug}</Badge>
      </h1>

      {/* Recipe Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recipes.map((recipe) => {
          const imageUrl = recipe.images?.[0]?.url ?? ""; // fallback if no image

          return (
            <div key={recipe.id} className="border rounded p-2">
              {/* Thumbnail */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Thumbnail for ${recipe.title}`}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 mb-2 rounded flex items-center justify-center text-sm text-gray-500">
                  Tiada Gambar
                </div>
              )}

              <h2 className="text-lg font-semibold">
                <Link
                  href={`/resepi/${recipe.slug}`}
                  className="hover:underline"
                >
                  {recipe.title}
                </Link>
              </h2>

              {recipe.shortDescription && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {recipe.shortDescription}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {currentPage > 1 && (
          <Link href={`/resepi/tag/${tagSlug}?page=${currentPage - 1}`}>
            <Button variant="outline">Previous</Button>
          </Link>
        )}
        <span className="text-sm text-gray-500">
          Halaman {currentPage} daripada {totalPages}
        </span>
        {currentPage < totalPages && (
          <Link href={`/resepi/tag/${tagSlug}?page=${currentPage + 1}`}>
            <Button variant="outline">Next</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
