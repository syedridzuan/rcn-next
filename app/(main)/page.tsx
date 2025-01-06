// File: app/(main)/page.tsx

import { prisma } from "@/lib/db";
import NewsletterForm from "@/components/NewsletterForm";

import HeroSection from "./home/HeroSection";
import EditorsPickSection from "./home/EditorsPickSection";
import LatestRecipesSection from "./home/LatestRecipesSection";
import PopularCategoriesSection from "./home/PopularCategoriesSection";
import LatestGuidesSection from "./home/LatestGuidesSection";

/**
 * Fetch up to 5 Editor's Pick recipes with status = PUBLISHED,
 * ordered by publishedAt DESC.
 */
async function getEditorsPickRecipes() {
  return prisma.recipe.findMany({
    where: {
      status: "PUBLISHED",
      isEditorsPick: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 5,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

/**
 * Fetch up to 12 of the latest published recipes,
 * ordered by publishedAt DESC.
 */
async function getLatestRecipes() {
  return prisma.recipe.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

/**
 * Popular categories, unchanged (although you might
 * want to filter out categories that have zero published recipes).
 */
async function getPopularCategories() {
  return prisma.category.findMany({
    orderBy: { recipesCount: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      recipesCount: true,
    },
  });
}

/**
 * Latest Guides, unchanged.
 */
async function getLatestGuides() {
  return prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
    },
  });
}

/**
 * The main Home Page component.
 * Loads data concurrently and passes them to sub-sections.
 */
export default async function HomePage() {
  // 1) Load published recipes & other data in parallel
  const [editorsPickRecipes, latestRecipes, popularCategories, latestGuides] =
    await Promise.all([
      getEditorsPickRecipes(),
      getLatestRecipes(),
      getPopularCategories(),
      getLatestGuides(),
    ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />

      <EditorsPickSection recipes={editorsPickRecipes} />

      <LatestRecipesSection recipes={latestRecipes} title="Resepi Terkini" />

      <section className="bg-orange-100 rounded-lg p-8 my-16">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Langgan Surat Berita Kami
        </h2>
        <p className="text-center mb-6">
          Dapatkan resepi terbaru dan panduan memasak terus ke peti masuk anda!
        </p>
        <div className="max-w-lg mx-auto">
          <NewsletterForm />
        </div>
      </section>

      <PopularCategoriesSection categories={popularCategories} />
      <LatestGuidesSection guides={latestGuides} />
    </div>
  );
}
