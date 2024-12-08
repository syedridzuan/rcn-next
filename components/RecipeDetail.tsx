import { Recipe } from "@/types/recipe"
import { RecipeTips } from "./RecipeTips"
// ... other imports

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ... other recipe details ... */}

      {/* Tips Section */}
      {recipe.tips && recipe.tips.length > 0 && (
        <section className="mt-8">
          <RecipeTips tips={recipe.tips} />
        </section>
      )}

      {/* ... other sections ... */}
    </div>
  )
}

