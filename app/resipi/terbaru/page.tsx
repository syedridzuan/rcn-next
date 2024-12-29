// app/resipi/terbaru/page.tsx
import { getLatestRecipes } from "@/lib/db";

export default async function ResipiTerbaruPage() {
  const recipes = await getLatestRecipes();

  return (
    <main>
      <h1>Resipi Terbaru</h1>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h2>{recipe.title}</h2>
        </div>
      ))}
    </main>
  );
}
