// app/admin/recipes/ai-audit/page.tsx
import { auth } from "@/lib/auth"; // or wherever you import your admin-check logic
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import RecipeAuditCard from "./RecipeAuditCard";

export default async function AiAuditPage() {
  // 1. Check if user is admin
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    // Option A: throw notFound or redirect
    return notFound();
    // OR redirect("/admin/login") if you have an admin login route
  }

  // 2. Fetch recipes that have at least one openai* field set
  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { openaiPrepTime: { not: null } },
        { openaiCookTime: { not: null } },
        { openaiTotalTime: { not: null } },
        { openaiDifficulty: { not: null } },
        { openaiTags: { not: null } },
        { openaiServingType: { not: null } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">AI Audit</h1>
      {recipes.length === 0 ? (
        <p className="text-gray-600">No recipes pending AI suggestions.</p>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <RecipeAuditCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}
