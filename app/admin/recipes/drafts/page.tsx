// File: app/admin/recipes/drafts/page.tsx

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

// We no longer define deleteDraftRecipeAction here.
// Instead, we'll import our DeleteDraftButton.

import DeleteDraftButton from "./DeleteDraftButton";

export default async function DraftRecipesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const draftsFromDB = await prisma.draftRecipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  const drafts = draftsFromDB.map((draft) => ({
    ...draft,
    createdAtString: formatDate(draft.createdAt, { time: true }),
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Draft Recipes</h1>

      {drafts.length === 0 ? (
        <p>No draft recipes found.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border-b">Title</th>
              <th className="p-2 border-b">Created At</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft.id}>
                <td className="p-2 border-b">{draft.title}</td>
                <td className="p-2 border-b">{draft.createdAtString}</td>
                <td className="p-2 border-b">
                  <a
                    href={`/admin/recipes/drafts/${draft.id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Edit
                  </a>
                  <DeleteDraftButton draftId={draft.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
