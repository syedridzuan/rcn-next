// File: app/admin/recipes/generate/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * We import the client form (which uses hooks) from a separate file,
 * so we do NOT import useState in this file.
 */
import FormGenerateRecipe from "./FormGenerateRecipe";

export default async function GenerateRecipePage() {
  // Example: auth check
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Because this is a server component, we can do DB reads if needed here
  // or pass props to the client component.

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Recipe Draft</h1>
      <p className="mb-4 text-gray-600">
        Paste a YouTube voiceover script below and tweak the prompt as needed.
        When you click &ldquo;Generate&rdquo;, we'll call OpenAI to parse the
        script into a structured recipe, then store it as a new
        <code>DraftRecipe</code>.
      </p>
      <FormGenerateRecipe />
    </div>
  );
}
