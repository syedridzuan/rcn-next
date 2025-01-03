// app/(main)/home/LatestRecipesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { isOlderThanOneWeek } from "@/lib/helpers/isOlderThanOneWeek";

/**
 * Extend the default Recipe type to ensure we have `createdAt`
 * (or any additional fields you need) plus your image relation.
 */
interface LatestRecipe extends Recipe {
  images?: {
    id: string;
    mediumUrl: string;
    alt?: string | null;
  }[];
}

interface LatestRecipesSectionProps {
  recipes: LatestRecipe[];
  title?: string;
  /**
   * If true, user can see newly published recipes immediately.
   * If false, user only sees recipes older than 7 days.
   */
  hasActiveSubscription: boolean;
}

export default function LatestRecipesSection({
  recipes,
  title = "Resepi Terbaru",
  hasActiveSubscription,
}: LatestRecipesSectionProps) {
  // If user does NOT have an active subscription,
  // only show recipes older than 1 week.
  const filteredRecipes = hasActiveSubscription
    ? recipes
    : recipes.filter((r) => {
        if (!r.createdAt) return false;
        return isOlderThanOneWeek(r.createdAt);
      });

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      {filteredRecipes.length < 1 ? (
        <p className="text-gray-600">
          {hasActiveSubscription
            ? "Tiada resepi terkini buat masa ini."
            : "Anda belum boleh melihat resepi terkini (7 hari). Langgan untuk akses segera!"}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => {
            const primaryImage = recipe.images?.[0];

            return (
              <article
                key={recipe.id}
                className="p-4 border rounded-md bg-white hover:shadow transition"
              >
                {primaryImage && (
                  <div className="relative w-full h-40 mb-2">
                    <Image
                      src={primaryImage.mediumUrl}
                      alt={primaryImage.alt || recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <Link href={`/resepi/${recipe.slug}`} className="block mb-2">
                  <h3 className="text-lg font-semibold hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600">
                  {recipe.shortDescription ?? "Tiada ringkasan disediakan."}
                </p>

                <div className="mt-2">
                  <Badge variant="outline">{recipe.difficulty}</Badge>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
