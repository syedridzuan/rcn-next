// app/resipi/popular/page.tsx
import { getPopularRecipes } from "@/lib/db";

export default async function ResipiPopularPage() {
  const recipes = await getPopularRecipes();

  return (
    <main>
      <h1>Resipi Popular</h1>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h2>{recipe.title}</h2>
        </div>
      ))}
    </main>
  );
}
