import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddSectionForm } from "./AddSectionForm";

async function getGuide(id: string) {
  return await prisma.guide.findUnique({
    where: { id },
    include: {
      sections: true,
    },
  });
}

interface EditGuidePageProps {
  params: { id: string };
}

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  const { id } = await params; // Wait for params to resolve
  const guide = await getGuide(id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Editing: {guide.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{guide.content || "No main content provided."}</p>
          <div className="mt-4 space-y-2">
            <h2 className="font-semibold">Sections</h2>
            {guide.sections.length === 0 ? (
              <p className="text-gray-500">No sections yet.</p>
            ) : (
              guide.sections.map((section) => (
                <div key={section.id} className="border p-2 rounded">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-gray-700">{section.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddSectionForm guideId={guide.id} />
    </div>
  );
}
