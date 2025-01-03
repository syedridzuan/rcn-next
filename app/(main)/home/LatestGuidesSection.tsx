// app/(main)/home/LatestGuidesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GuideImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
}

interface Guide {
  id: string;
  title: string;
  slug: string;
  createdAt: string; // or Date if you handle conversion
  images?: GuideImage[]; // optional array of images
}

interface LatestGuidesSectionProps {
  guides: Guide[];
}

export default function LatestGuidesSection({
  guides,
}: LatestGuidesSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6">Panduan Terkini</h2>

      {guides.length === 0 ? (
        <p className="text-gray-500">Tiada panduan ditemui.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => {
            // Find the primary image or fallback to the first image if available
            const primaryImg =
              guide.images?.find((img) => img.isPrimary) ?? guide.images?.[0];

            return (
              <Card key={guide.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>
                    Dicipta pada:{" "}
                    {new Date(guide.createdAt).toLocaleDateString("ms-MY")}
                  </CardDescription>
                </CardHeader>

                {/* If there's a primary or fallback image, display it */}
                {primaryImg && (
                  <div className="relative w-full h-40">
                    <Image
                      src={primaryImg.url}
                      alt={primaryImg.alt || guide.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <CardFooter className="mt-auto">
                  <Link href={`/guides/${guide.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Lihat Panduan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
