// app/(main)/(ads-enabled)/resepi/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tag, Eye as EyeIcon } from "lucide-react";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/recipes/print-button";
import { RecipeMetaCards } from "./recipe-meta-cards";
import { RecipeSections } from "@/components/RecipeSections";
import { RecipeTips } from "@/components/RecipeTips";
import { CommentsWrapper } from "@/components/comments/comments-wrapper";
import { AuthorSpotlight } from "@/components/author-spotlight";
import { LikeButtonRecipe } from "./LikeButtonRecipe";
import { SaveRecipeButton } from "./SaveRecipeButton";
import { incrementRecipeView } from "@/lib/incrementViews";
import { hasActiveSubscription } from "@/lib/subscription";
import { auth } from "@/auth";

import type { ServingType, RecipeDifficulty } from "@prisma/client";

type PageParams = { slug: string };

// A helper to load the recipe from the DB
async function getRecipe(slug: string) {
  const session = await auth();
  return prisma.recipe.findUnique({
    where: { slug },
    include: {
      sections: {
        include: { items: true },
        orderBy: { id: "asc" },
      },
      tips: true,
      images: true,
      category: true,
      tags: true,
      comments: {
        where: { status: "APPROVED" },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: {
          name: true,
          username: true,
          recipeCount: true,
          image: true,
          instagramHandle: true,
          facebookHandle: true,
          tiktokHandle: true,
          blogUrl: true,
        },
      },
      _count: {
        select: { comments: true },
      },
      // Pull the "saved" record if logged in
      savedBy: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true, notes: true },
            take: 1,
          }
        : undefined,
    },
  });
}

// A small map for your difficulty enum
const difficultyTranslations: Record<RecipeDifficulty, string> = {
  EASY: "Mudah",
  MEDIUM: "Sederhana",
  HARD: "Sukar",
  EXPERT: "Pakar",
};

export async function generateMetadata({
  params: asyncParams,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await asyncParams;
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
      images: recipe.images?.[0]?.url ? [recipe.images[0].url] : [],
      locale: "ms_MY",
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description ?? "",
    },
  };
}

export default async function ResepePage({
  params: asyncParams,
}: {
  params: Promise<PageParams>;
}) {
  // 1) Await the dynamic route param
  const { slug } = await asyncParams;

  // 2) Load the recipe
  const recipe = await getRecipe(slug);
  if (!recipe) {
    notFound();
  }

  // 3) Check subscription
  const session = await auth();
  let isSubscribed = false;
  if (session?.user?.id) {
    isSubscribed = await hasActiveSubscription(session.user.id);
  }

  // 4) increment view count
  await incrementRecipeView(recipe.id);

  // --------------------------------------------
  // LOGIC: prefer any openaiXxxTimeText if present
  // --------------------------------------------
  const finalPrepTimeText =
    recipe.openaiPrepTimeText?.trim() ||
    (typeof recipe.openaiPrepTime === "number"
      ? `${recipe.openaiPrepTime} min`
      : recipe.prepTime
      ? `${recipe.prepTime} min`
      : "");

  const finalCookTimeText =
    recipe.openaiCookTimeText?.trim() ||
    (typeof recipe.openaiCookTime === "number"
      ? `${recipe.openaiCookTime} min`
      : recipe.cookTime
      ? `${recipe.cookTime} min`
      : "");

  const finalTotalTimeText =
    recipe.openaiTotalTimeText?.trim() ||
    (typeof recipe.openaiTotalTime === "number"
      ? `${recipe.openaiTotalTime} min`
      : recipe.totalTime
      ? `${recipe.totalTime} min`
      : "N/A");

  // numeric fallback for meta cards
  const finalPrepTimeNum =
    typeof recipe.openaiPrepTime === "number"
      ? recipe.openaiPrepTime
      : recipe.prepTime ?? null;

  const finalCookTimeNum =
    typeof recipe.openaiCookTime === "number"
      ? recipe.openaiCookTime
      : recipe.cookTime ?? null;

  const finalTotalTimeNum =
    typeof recipe.openaiTotalTime === "number"
      ? recipe.openaiTotalTime
      : recipe.totalTime ?? null;

  const finalDifficulty = recipe.openaiDifficulty ?? recipe.difficulty;
  const finalServings = recipe.openaiServings ?? recipe.servings;
  const finalServingType: ServingType = recipe.openaiServingType ?? "PEOPLE";

  // Grab the first (primary) image
  const primaryImage =
    recipe.images.find((img) => img.isPrimary) || recipe.images[0];

  // Build a final "display tags" array:
  // If recipe.tags is non-empty, use that
  // else if openaiTags is an array of strings, show them as fallback
  let finalDisplayTags: Array<{ name: string; slug?: string }> = [];
  if (recipe.tags && recipe.tags.length > 0) {
    // Use real DB tags
    finalDisplayTags = recipe.tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
    }));
  } else if (Array.isArray(recipe.openaiTags)) {
    // fallback to openaiTags (strings)
    finalDisplayTags = recipe.openaiTags.map((tagStr: string) => ({
      name: tagStr,
    }));
  }

  // JSON-LD data for SEO
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
    prepTime: finalPrepTimeNum ? `PT${finalPrepTimeNum}M` : undefined,
    cookTime: finalCookTimeNum ? `PT${finalCookTimeNum}M` : undefined,
    totalTime: finalTotalTimeNum ? `PT${finalTotalTimeNum}M` : undefined,
    recipeYield: finalServings,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          {/* Image */}
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

          {/* Title & Difficulty */}
          <div className="flex flex-col gap-4">
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
              <Badge
                variant="outline"
                className="text-sm md:text-base font-semibold px-3 py-1 bg-orange-50 text-orange-700 border-orange-200"
              >
                {difficultyTranslations[finalDifficulty]}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold">{recipe.title}</h1>
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

              <div className="flex gap-2">
                <LikeButtonRecipe recipeId={recipe.id} />
                <SaveRecipeButton
                  recipeId={recipe.id}
                  savedRecipeId={recipe.savedBy?.[0]?.id}
                  existingNote={recipe.savedBy?.[0]?.notes}
                  isSubscribed={isSubscribed}
                />
                <PrintButton label="Cetak Resepi" />
              </div>
            </div>

            {/* Date + Views */}
            <div className="flex items-center gap-8 text-base text-gray-600 mt-2 font-medium">
              <span>
                Diterbitkan pada {formatDate(recipe.createdAt, { time: false })}
              </span>
              {typeof recipe.viewCount === "number" && (
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                  {recipe.viewCount} paparan
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Meta Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <RecipeMetaCards
            prepTime={finalPrepTimeNum}
            prepTimeText={finalPrepTimeText}
            cookTime={finalCookTimeNum}
            cookTimeText={finalCookTimeText}
            totalTime={finalTotalTimeNum}
            totalTimeText={finalTotalTimeText}
            servings={finalServings}
            servingType={finalServingType}
          />
        </div>

        {/* Tag listing - real DB tags OR openaiTags fallback */}
        {/*
  EXCERPT from app/(main)/(ads-enabled)/resepi/[slug]/page.tsx
  Focusing on the finalDisplayTags rendering
*/}
        {finalDisplayTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {finalDisplayTags.map((tag, idx) => {
                // If real DB tag has a slug, we link to /resepi/tag/[slug]
                if (tag.slug) {
                  return (
                    <Link
                      key={tag.slug}
                      href={`/resepi/tag/${tag.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-sm bg-orange-100 text-orange-700
                         hover:bg-orange-200 transition-colors
                         cursor-pointer focus:outline-none focus:ring-2
                         focus:ring-orange-300 focus:ring-offset-1 focus:ring-offset-white"
                    >
                      <Tag className="w-4 h-4" />
                      <span>{tag.name}</span>
                    </Link>
                  );
                }

                // Fallback: If this tag came from openaiTags, it won't have a slug in DB.
                // Link it to a search page so at least the user can attempt to find matching recipes:
                if (tag.name) {
                  const searchParam = encodeURIComponent(
                    tag.name.toLowerCase()
                  );
                  return (
                    <Link
                      key={`openai-${idx}`}
                      href={`/resepi/cari?keyword=${searchParam}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-sm bg-orange-100 text-orange-700
                         hover:bg-orange-200 transition-colors
                         cursor-pointer focus:outline-none focus:ring-2
                         focus:ring-orange-300 focus:ring-offset-1 focus:ring-offset-white"
                    >
                      <Tag className="w-4 h-4" />
                      <span>{tag.name}</span>
                    </Link>
                  );
                }

                // If there's no name and no slug, fallback to non-clickable text
                return (
                  <span
                    key={`filler-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       text-sm bg-orange-100 text-orange-700
                       cursor-default select-text"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Unlabeled</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
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

          {/* Author */}
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
