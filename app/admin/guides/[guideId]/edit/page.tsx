import { Suspense } from "react";
import { Metadata } from "next";
import { EditGuideForm } from "./edit-guide-form";
import { adminShell } from "@/components/shell";
import { adminHeader } from "@/components/admin-header";
import { LoadingPage } from "@/components/loading";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface EditGuidePageProps {
  params: { guideId: string };
}

export const metadata: Metadata = {
  title: "Edit Guide",
  description: "Edit your guide content",
};

async function getGuide(guideId: Promise<string> | string) {
  const resolvedId = await guideId;

  const guide = await prisma.guide.findUnique({
    where: { id: resolvedId },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      authorId: true,
      sections: {
        orderBy: {
          createdAt: "asc",
        },
      },
      tags: true,
      images: {
        orderBy: {
          isPrimary: "desc",
        },
      },
    },
  });

  if (!guide) notFound();

  return {
    ...guide,
    content: guide.content || "",
  };
}

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  const guide = await getGuide(Promise.resolve(params.guideId));

  return (
    <adminShell>
      <adminHeader
        heading="Edit Guide"
        text="Make changes to your guide content"
      >
        <Link href={`/admin/guides/${params.guideId}/images`}>
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Manage Images
          </Button>
        </Link>
      </adminHeader>
      <div className="grid gap-8">
        <Suspense fallback={<LoadingPage />}>
          <EditGuideForm guide={guide} />
        </Suspense>
      </div>
    </adminShell>
  );
}
