// app/(main)/(ads-enabled)/resepi/tag/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getRecipesByTag } from "@/lib/getRecipesByTag";
import { RecipeList } from "./RecipeList";

const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TagRecipePage(props: PageProps) {
  // 1) Await dynamic route + searchParams
  const { slug } = await props.params;
  const { page: pageParam = "1" } = await props.searchParams;

  // 2) Convert page string -> integer
  const page = parseInt(pageParam, 10);
  if (isNaN(page) || page < 1) {
    return notFound();
  }

  // 3) Fetch recipes from getRecipesByTag
  const { recipes, totalCount } = await getRecipesByTag({
    slug,
    page,
    pageSize: PAGE_SIZE,
  });

  // If no recipes found, show a message
  if (!recipes || recipes.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">
          Tiada resepi ditemui untuk tag: {slug}
        </h1>
        <p>
          Mungkin tiada resepi untuk tag ini atau semua resipi belum
          diterbitkan.
        </p>
      </div>
    );
  }

  // 4) Calculate total pages
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 5) Render
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
