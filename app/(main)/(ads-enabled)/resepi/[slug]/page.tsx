import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tag, Clock, Users } from "lucide-react";
import { Suspense } from "react";
import { AuthorSpotlight } from "@/components/author-spotlight";
import { prisma } from "@/lib/db";
import { absoluteUrl, formatDate, slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PrintButton } from "@/components/recipes/print-button";
import { RecipeMetaCards } from "./recipe-meta-cards";
import { RecipeSections } from "@/components/RecipeSections";
import { RecipeTips } from "@/components/RecipeTips";
import { CommentsWrapper } from "@/components/comments/comments-wrapper";
import { SaveRecipeButton } from "./SaveRecipeButton";
import { auth } from "@/auth";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getRecipe(slug: string) {
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      sections: {
        include: { items: true },
        orderBy: { id: "asc" },
      },
      tips: true,
      comments: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: {
          name: true,
          username: true,
          recipeCount: true, // <--- add this
          image: true,
          instagramHandle: true,
          facebookHandle: true,
          tiktokHandle: true,
          blogUrl: true,
        },
      },
      category: true,
      _count: {
        select: { comments: true },
      },
      images: true,
      tags: true,
      savedBy: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true, notes: true },
            take: 1,
          }
        : undefined,
    },
  });

  if (!recipe) {
    return null;
  }

  return recipe;
}

export async function generateMetadata({
  params,
}: {
  params: PageProps["params"];
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) {
    return { title: "Resepi Tidak Dijumpai" };
  }

  const url = absoluteUrl(`/resepi/${recipe.slug}`);
  return {
    title: `${recipe.title} - Resepi`,
    description: recipe.description ?? "",
    openGraph: {
      title: recipe.title,
      description: recipe.description ?? "",
      type: "article",
      url,
      images: recipe.image ? [recipe.image] : [],
      locale: "ms_MY",
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description ?? "",
    },
  };
}

// Optional difficulty label translations
const difficultyTranslations: Record<string, string> = {
  EASY: "Mudah",
  MEDIUM: "Sederhana",
  HARD: "Sukar",
  EXPERT: "Pakar",
};

export default async function ResepePage({
  params,
}: {
  params: PageProps["params"];
}) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) {
    notFound();
  }

  // Get primary or first image
  const primaryImage =
    recipe.images.find((img) => img.isPrimary) || recipe.images[0];

  // Structured Data (for SEO)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: primaryImage?.url,
    author: {
      "@type": "Person",
      name: recipe.user?.name || "Anonymous",
    },
    datePublished: recipe.createdAt?.toISOString(),
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.prepTime + recipe.cookTime || recipe.totalTime}M`,
    recipeYield: recipe.servings,
    recipeCategory: recipe.category?.name,
    recipeCuisine: "Malaysian",
    recipeIngredient:
      recipe.sections
        ?.filter((sec) => sec.type === "INGREDIENTS")
        ?.flatMap((sec) => sec.items.map((it) => it.content)) || [],
    recipeInstructions:
      recipe.sections
        ?.filter((sec) => sec.type === "INSTRUCTIONS")
        ?.flatMap((sec) =>
          sec.items.map((it, idx) => ({
            "@type": "HowToStep",
            position: idx + 1,
            text: it.content,
          }))
        ) || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* -- Hero / Header -- */}
        <header className="mb-8">
          {primaryImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || recipe.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                       33vw"
                quality={100}
              />
            </div>
          )}

          {/* Optional: Gallery */}
          {recipe.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              {recipe.images.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    image.isPrimary ? "ring-2 ring-orange-500" : ""
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Category & Difficulty */}
            <div className="flex flex-wrap items-center gap-2">
              {recipe.category && (
                <>
                  <Link
                    href={`/kategori/${recipe.category.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {recipe.category.name}
                  </Link>
                  <span className="text-gray-400">•</span>
                </>
              )}

              {/* Updated Difficulty Badge */}
              <Badge
                variant="outline"
                className="text-sm md:text-base font-semibold px-3 py-1 bg-orange-50 text-orange-700 border-orange-200"
              >
                {difficultyTranslations[recipe.difficulty] ?? recipe.difficulty}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold">{recipe.title}</h1>

            {/* Description */}
            {recipe.description && (
              <div
                className="text-gray-600 text-lg"
                dangerouslySetInnerHTML={{
                  __html: recipe.description.replace(/<\/p>/g, "</p>&nbsp;"),
                }}
              />
            )}

            {/* Author & Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Author */}
              <div className="flex items-center gap-2">
                {recipe.user?.image && (
                  <Image
                    src={recipe.user.image}
                    alt={recipe.user.name || ""}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm text-gray-500">Dikongsi oleh</p>
                  <p className="font-medium">{recipe.user?.name}</p>
                </div>
              </div>

              {/* Save & Print Buttons */}
              <div className="flex gap-2">
                <SaveRecipeButton
                  recipeId={recipe.id}
                  savedRecipeId={recipe.savedBy?.[0]?.id}
                  existingNote={recipe.savedBy?.[0]?.notes}
                />
                <PrintButton label="Cetak Resepi" />
              </div>
            </div>

            {/* Publish Date */}
            <div className="text-sm text-gray-500">
              Diterbitkan pada {formatDate(recipe.createdAt)}
            </div>
          </div>
        </header>

        {/* -- Meta Info (Time, Servings, etc.) -- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <RecipeMetaCards
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            totalTime={recipe.totalTime}
            servings={recipe.servings}
            labels={{
              prepTime: "Masa Penyediaan",
              cookTime: "Masa Memasak",
              totalTime: "Jumlah Masa",
              servings: "Hidangan",
              minutes: "minit",
              people: "orang",
            }}
          />
        </div>

        {/* -- Tags -- */}
        {recipe.tags?.length ? (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/resepi/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* -- Recipe Content -- */}
        <div className="space-y-8">
          {/* Ingredients & Instructions */}
          <RecipeSections
            sections={recipe.sections}
            labels={{
              ingredients: "Bahan-bahan",
              instructions: "Cara Memasak",
            }}
          />

          {/* Tips */}
          {recipe.tips?.length ? (
            <section className="mt-8">
              <RecipeTips tips={recipe.tips} />
            </section>
          ) : null}

          <AuthorSpotlight user={recipe.user} />

          {/* Comments */}
          <section className="mt-12">
            <Suspense fallback={<div>Loading comments...</div>}>
              <CommentsWrapper
                recipeId={recipe.id}
                initialComments={recipe.comments}
              />
            </Suspense>
          </section>
        </div>
      </article>
    </>
  );
}
