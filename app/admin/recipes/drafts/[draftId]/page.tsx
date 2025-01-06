import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import EditDraftForm from "./EditDraftForm";

export default async function Page({
  params,
}: {
  // Note the type: Promise<{ draftId: string }>
  params: Promise<{ draftId: string }>;
}) {
  // Await the params object
  const { draftId } = await params;

  // Load the draft
  const draft = await prisma.draftRecipe.findUnique({
    where: { id: draftId },
  });
  if (!draft) {
    notFound();
  }

  // Convert decimal => string if needed
  const safeOpenaiCost = draft.openaiCost?.toString() ?? null;

  // Format date
  const createdAtString = formatDate(draft.createdAt, { time: true });
  const updatedAtString = formatDate(draft.updatedAt, { time: true });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Draft: {draft.title}</h1>
      <EditDraftForm
        draft={{
          ...draft,
          openaiCost: safeOpenaiCost,
          createdAtString,
          updatedAtString,
        }}
      />
    </div>
  );
}
