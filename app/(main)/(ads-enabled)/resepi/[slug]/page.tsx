// app/(main)/(ads-enabled)/resepi/[slug]/page.tsx

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { incrementRecipeView } from "@/lib/incrementViews";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/recipes/print-button";
import { RecipeSections } from "@/components/RecipeSections";
import { RecipeTips } from "@/components/RecipeTips";
import { CommentsWrapper } from "@/components/comments/comments-wrapper";
import { AuthorSpotlight } from "@/components/author-spotlight";
import { LikeButtonRecipe } from "./LikeButtonRecipe";
import { SaveRecipeButton } from "./SaveRecipeButton";
import { RecipeMetaCards } from "./recipe-meta-cards";

import { Eye as EyeIcon, Tag } from "lucide-react";
import type { RecipeDifficulty, ServingType } from "@prisma/client";

// 1) Import your helper
import { hasActiveSubscription } from "@/lib/subscription";
import { isOlderThanOneWeek } from "@/lib/helpers/isOlderThanOneWeek";

/**
 * A helper to load the recipe from the DB
 * including all relations you need in the UI.
 */
async function getRecipe(slug: string) {
  // 1) We fetch the user session
  const session = await auth();

  // 2) Query the recipe from DB
  const recipe = await prisma.recipe.findUnique({
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
      savedBy: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true, notes: true },
            take: 1,
          }
        : undefined,
    },
  });

  // 3) If no recipe found, return null → leads to notFound()
  if (!recipe) {
    return null;
  }

  // 4) If the recipe is marked as membersOnly
  if (recipe.membersOnly) {
    console.log("Recipe is membersOnly, checking subscription...");
    // Check if user is logged in and has active sub
    let userHasActiveSub = false;
    if (session?.user?.id) {
      userHasActiveSub = await hasActiveSubscription(session.user.id);
      console.log("User has active subscription:", userHasActiveSub);
    }

    // If userHasActiveSub is false, decide on your approach:
    // Option A: return null so we do `notFound()`
    // Option B: redirect to a subscription page
    if (!userHasActiveSub) {
      // e.g. Option A:
      //return null;

      // or Option B:
      redirect("/langganan?reason=members-only");
      return null;
      // return null;
    }
  }

  let showFullRecipe = false;
  if (session?.user?.id) {
    showFullRecipe = await hasActiveSubscription(session.user.id);
  }
  
  // Allow full access if recipe is older than a week
  if (!showFullRecipe && recipe.createdAt) {
    showFullRecipe = isOlderThanOneWeek(recipe.createdAt);
  }

  return {
    ...recipe,
    showFullRecipe,
  };
}

/** Difficulty translations for display */
const difficultyTranslations: Record<RecipeDifficulty, string> = {
  EASY: "Mudah",
  MEDIUM: "Sederhana",
  HARD: "Sukar",
  EXPERT: "Pakar",
};

/**
 * Generate the SEO metadata
 */
export async function generateMetadata({
  params: promisedParams,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await promisedParams;
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

export default async function RecipePage({
  params: promisedParams,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1) Obtain the slug
  const { slug } = await promisedParams;

  // 2) Load the recipe from DB (with subscription check if membersOnly)
  const recipe = await getRecipe(slug);

  // 3) If no recipe (either does not exist or membership blocked => null)
  if (!recipe) {
    notFound();
  }

  // 4) Increment the view count
  await incrementRecipeView(recipe.id);

  // 5) Derive fallback text for times & difficulty
  const finalPrepTime = recipe.prepTime || 0;
  const finalCookTime = recipe.cookTime || 0;
  const finalTotalTime = recipe.totalTime || 0;
  const finalDifficulty = recipe.difficulty;
  const finalServings = recipe.servings || 1;
  const finalServingType: ServingType = recipe.servingType ?? "PEOPLE";

  // Build display text for your recipe meta
  const prepTimeText = finalPrepTime > 0 ? `${finalPrepTime} min` : "N/A";
  const cookTimeText = finalCookTime > 0 ? `${finalCookTime} min` : "N/A";
  const totalTimeText = finalTotalTime > 0 ? `${finalTotalTime} min` : "N/A";

  // Decide which image is primary
  const primaryImage =
    recipe.images.find((img) => img.isPrimary) || recipe.images[0];

  // Build final display tags from real DB tags
  const finalDisplayTags = recipe.tags.map((tag) => ({
    name: tag.name,
    slug: tag.slug,
  }));

  // JSON-LD structured data
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
    prepTime: finalPrepTime ? `PT${finalPrepTime}M` : undefined,
    cookTime: finalCookTime ? `PT${finalCookTime}M` : undefined,
    totalTime: finalTotalTime ? `PT${finalTotalTime}M` : undefined,
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
          {/* Main image */}
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

          {/* Category + Difficulty */}
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
                className="text-sm md:text-base font-semibold px-3 py-1
                           bg-orange-50 text-orange-700 border-orange-200"
              >
                {difficultyTranslations[finalDifficulty]}
              </Badge>
            </div>

            {/* Title & Description */}
            <h1 className="text-4xl font-bold">{recipe.title}</h1>
            {recipe.description && (
              <div
                className="text-gray-600 text-lg"
                dangerouslySetInnerHTML={{ __html: recipe.description }}
              />
            )}

            {/* Author & Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Author info */}
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

              {/* Like / Save / Print */}
              <div className="flex gap-2">
                <LikeButtonRecipe recipeId={recipe.id} />
                <SaveRecipeButton
                  recipeId={recipe.id}
                  savedRecipeId={recipe.savedBy?.[0]?.id}
                  existingNote={recipe.savedBy?.[0]?.notes}
                  isSubscribed={false}
                />
                <PrintButton label="Cetak Resepi" />
              </div>
            </div>

            {/* Date + ViewCount */}
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
            prepTime={recipe.prepTime}
            prepTimeText={prepTimeText}
            cookTime={recipe.cookTime}
            cookTimeText={cookTimeText}
            totalTime={recipe.totalTime}
            totalTimeText={totalTimeText}
            servings={recipe.servings}
            servingType={finalServingType}
          />
        </div>

        {/* Tags from real DB tags only */}
        {finalDisplayTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {finalDisplayTags.map((tag) => (
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
              ))}
            </div>
          </div>
        )}

        {/* Recipe Sections (INGREDIENTS & INSTRUCTIONS) */}
        <RecipeSections
          sections={recipe.sections.filter(section => 
            recipe.showFullRecipe || section.type === "INGREDIENTS"
          )}
          labels={{
            ingredients: "Bahan-bahan",
            instructions: "Cara Memasak",
          }}
        />

        {!recipe.showFullRecipe && (
          <div className="mt-8 p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-orange-800 font-medium">
              Untuk melihat cara memasak penuh dan tips, sila langgani atau tunggu seminggu dari tarikh penerbitan.
            </p>
            <Link 
              href="/langganan" 
              className="mt-2 inline-block px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Langgani Sekarang
            </Link>
          </div>
        )}

        {/* Tips */}
        {recipe.tips?.length && recipe.showFullRecipe ? (
          <section className="mt-8">
            <RecipeTips tips={recipe.tips} />
          </section>
        ) : null}

        {/* Author */}
        <section className="mt-8">
          <Suspense fallback={<div>Loading author info...</div>}>
            <AuthorSpotlight user={recipe.user} />
          </Suspense>
        </section>

        {/* Comments */}
        <section className="mt-12">
          <Suspense fallback={<div>Loading comments...</div>}>
            <CommentsWrapper
              recipeId={recipe.id}
              initialComments={recipe.comments}
            />
          </Suspense>
        </section>
      </article>
    </>
  );
}
