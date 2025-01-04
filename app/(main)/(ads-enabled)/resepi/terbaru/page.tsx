// app/resipi/terbaru/page.tsx
import { getLatestRecipes } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export default async function ResipiTerbaruPage() {
  const recipes = await getLatestRecipes();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Resipi Terbaru</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Link href={`/resepi/${recipe.slug}`} key={recipe.id}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {recipe.images?.[0] && (
                <div className="relative h-48">
                  <Image
                    src={recipe.images[0].mediumUrl}
                    alt={recipe.images[0].alt || recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{recipe.shortDescription}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>⏱️ {recipe.totalTime} min</span>
                    <span>👥 {recipe.servings} {recipe.servingType?.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❤️ {recipe.likeCount}</span>
                    {/* <span>⭐ {recipe.avgRating || '-'}</span> */}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
