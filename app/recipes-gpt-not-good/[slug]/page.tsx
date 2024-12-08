import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface RecipeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { slug } = await params;

  // Fetch recipe with sections, items, and images
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      sections: {
        include: {
          items: true,
        },
      },
      images: true, // Include images
    },
  });

  if (!recipe) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Recipe Not Found</h1>
        <p>The recipe you are looking for does not exist.</p>
      </div>
    );
  }

  // Separate sections by type
  const ingredientsSection = recipe.sections.find(
    (section) => section.type === "INGREDIENTS"
  );
  const instructionsSection = recipe.sections.find(
    (section) => section.type === "INSTRUCTIONS"
  );
  const tipsSection = recipe.sections.find(
    (section) => section.type === "TIPS"
  );

  return (
    <div className="p-4">
      {/* Header with Manage Images Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <Link href={`/recipes/${recipe.id}/manage-images`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
            Manage Images
          </button>
        </Link>
      </div>

      {/* Display Primary Image */}
      {recipe.images.length > 0 && (
        <div className="mb-6">
          <img
            src={
              recipe.images.find((image) => image.isPrimary)?.url ||
              recipe.images[0].url
            }
            alt={recipe.title}
            className="w-full h-auto rounded-md shadow"
          />
        </div>
      )}

      {/* Display All Images */}
      {recipe.images.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recipe.images.map((image) => (
            <img
              key={image.id}
              src={image.thumbnailUrl || image.url}
              alt={image.alt || "Recipe Image"}
              className="w-full h-auto rounded-md shadow"
            />
          ))}
        </div>
      )}

      {/* Ingredients Section */}
      {ingredientsSection && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">Ingredients</h2>
          <ul className="list-disc list-inside mb-4">
            {ingredientsSection.items.map((item) => (
              <li key={item.id}>{item.content}</li>
            ))}
          </ul>
        </>
      )}

      {/* Instructions Section */}
      {instructionsSection && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">Instructions</h2>
          <ol className="list-decimal list-inside">
            {instructionsSection.items.map((item, index) => (
              <li key={item.id} className="mb-2">
                {item.content}
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Tips Section */}
      {tipsSection && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">Tips</h2>
          <ul className="list-disc list-inside">
            {tipsSection.items.map((item) => (
              <li key={item.id}>{item.content}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
