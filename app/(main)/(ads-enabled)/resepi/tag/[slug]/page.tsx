import { notFound } from "next/navigation";
import { getRecipesByTag } from "@/lib/getRecipesByTag";
import { RecipeList } from "./RecipeList";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

const PAGE_SIZE = 10;

export default async function TagRecipePage({
  params,
  searchParams,
}: PageProps) {
  const slug = params.slug;
  const page = parseInt(searchParams?.page || "1", 10);
  if (isNaN(page) || page < 1) {
    return notFound();
  }

  const { recipes, totalCount } = await getRecipesByTag({ slug, page });
  if (!recipes || recipes.length === 0) {
    // If no recipes found
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">
          Tiada resepi ditemui untuk tag: {slug}
        </h1>
        {/* Example: a link back to /resepi */}
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Pass everything into your new component
  return (
    <main className="container mx-auto p-4">
      <RecipeList
        recipes={recipes}
        tagSlug={slug}
        currentPage={page}
        totalPages={totalPages}
      />
    </main>
  );
}
