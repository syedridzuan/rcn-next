"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * You can adapt these fields to match your actual recipe structure.
 */
interface RecipeLite {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
}

interface RecipeListProps {
  /** The array of recipes to display. */
  recipes: RecipeLite[];

  /** Which tag slug is being displayed. */
  tagSlug: string;

  /** The current page number. */
  currentPage: number;

  /** Total number of pages. */
  totalPages: number;
}

/**
 * Renders a grid of recipes + pagination controls,
 * separate from your data fetching logic in `page.tsx`.
 */
export function RecipeList({
  recipes,
  tagSlug,
  currentPage,
  totalPages,
}: RecipeListProps) {
  // Optional: page size (if needed for UI).
  // const PAGE_SIZE = 10;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Resepi dengan tag: <Badge>{tagSlug}</Badge>
      </h1>

      {/* Recipe Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border rounded p-2">
            <h2 className="text-lg font-semibold">
              <Link href={`/resepi/${recipe.slug}`} className="hover:underline">
                {recipe.title}
              </Link>
            </h2>
            {recipe.shortDescription && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                {recipe.shortDescription}
              </p>
            )}
            {/* Optionally display created date, rating, etc. */}
          </div>
        ))}
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
