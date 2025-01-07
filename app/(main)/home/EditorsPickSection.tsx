// app/(main)/home/EditorsPickSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@prisma/client"; // or your custom recipe type
import { Badge } from "@/components/ui/badge";

// Example type with images:
interface EditorsPickRecipe extends Recipe {
  images?: {
    id: string;
    mediumUrl: string;
    alt?: string | null;
    // Possibly other fields like isPrimary...
  }[];
}

interface EditorsPickSectionProps {
  recipes: EditorsPickRecipe[];
}

export default function EditorsPickSection({
  recipes,
}: EditorsPickSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Pilihan Editor</h2>

      {recipes.length < 1 ? (
        <p className="text-gray-600">
          Tiada resepi pilihan editor buat masa ini.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            // If you always fetch only the primary or first image, we can just do recipe.images[0]
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
