// app/(main)/home/PopularCategoriesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

// Example shape for category
interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  recipesCount: number;
}

interface PopularCategoriesSectionProps {
  categories: Category[];
}

export default function PopularCategoriesSection({
  categories,
}: PopularCategoriesSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-6">Kategori Popular</h2>
      {categories.length < 1 ? (
        <p className="text-gray-500">Tiada kategori tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <CardDescription>
                  {category.recipesCount} Resepi
                </CardDescription>
              </CardHeader>

              {/* If category has an image, display it */}
              {category.image && (
                <div className="relative w-full h-40">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <CardFooter className="mt-auto">
                <Link href={`/kategori/${category.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Lihat Kategori
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
