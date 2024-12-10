import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { AddImageForm } from "./AddImageForm";
import { deleteImageAction } from "./actions";

interface EditGuideImagesPageProps {
  params: { id: string };
}

async function getGuideWithImages(id: string) {
  return prisma.guide.findUnique({
    where: { id },
    include: { images: true },
  });
}

export default async function EditGuideImagesPage({
  params,
}: EditGuideImagesPageProps) {
  // await params if needed, depending on Next.js version
  const { id } = await params;
  const guide = await getGuideWithImages(id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Edit Images: {guide.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {guide.images.length === 0 ? (
            <p className="text-gray-500">No images yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {guide.images.map((img) => (
                <div key={img.id} className="border rounded p-2 space-y-2">
                  <div className="relative aspect-video">
                    <Image
                      src={img.url}
                      alt={img.alt ?? guide.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  {img.alt && <p className="text-sm">{img.alt}</p>}

                  {/* Delete form */}
                  <form action={deleteImageAction}>
                    <input type="hidden" name="imageId" value={img.id} />
                    {/* Optional: pass guideId if you want a more dynamic revalidate path */}
                    <input type="hidden" name="guideId" value={guide.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Form to upload new image */}
          <AddImageForm guideId={guide.id} />
        </CardContent>
      </Card>
    </div>
  );
}
