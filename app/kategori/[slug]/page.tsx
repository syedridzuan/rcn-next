import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import type { CategoryWithRecipes } from "@/types/category";

// Import CategoryLoading for Suspense fallback
import CategoryLoading from "./loading";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCategory(slug: string): Promise<CategoryWithRecipes> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        recipes: {
          include: {
            images: {
              where: { isPrimary: true },
            },
          },
        },
      },
    });

    if (!category) {
      notFound();
    }

    return category as CategoryWithRecipes;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    throw new Error("Failed to fetch category");
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const category = await getCategory(slug);

  return {
    title: `${category.name} Recipes`,
    description: category.description || `Browse ${category.name} recipes`,
  };
}

function RecipeCard({ recipe }: { recipe: CategoryWithRecipes["recipes"][0] }) {
  return (
    <Card className="overflow-hidden">
      {recipe.images[0] && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={recipe.images[0].mediumUrl}
            alt={recipe.images[0].alt || recipe.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
        {recipe.description && (
          <CardDescription className="line-clamp-2">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {recipe.prepTime + recipe.cookTime}m
          </Badge>
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            {recipe.servings} servings
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/resepi/${recipe.slug}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CategoryContent({ category }: { category: CategoryWithRecipes }) {
  return (
    <>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/kategori">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/kategori/${category.slug}`}>
              {category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>No Recipes Found</CardTitle>
            <CardDescription>
              There are no recipes in this category yet.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/recipes">Browse All Recipes</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}

export default async function CategoryPage({
  params: paramsPromise,
}: CategoryPageProps) {
  const { slug } = await paramsPromise;
  const category = await getCategory(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CategoryLoading />}>
        <CategoryContent category={category} />
      </Suspense>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}
