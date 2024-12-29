// app/resipi/page.tsx
import { getAllRecipes } from "@/lib/db"; // For example

export default async function ResipiPage() {
  const recipes = await getAllRecipes(); // or fetch from an API

  return (
    <main>
      <h1>Semua Resipi</h1>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h2>{recipe.title}</h2>
        </div>
      ))}
    </main>
  );
}
