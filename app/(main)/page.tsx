// app/(main)/page.tsx

import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";

// Imported sections
import HeroSection from "./home/HeroSection"; // <-- newly added
import EditorsPickSection from "./home/EditorsPickSection";
import LatestRecipesSection from "./home/LatestRecipesSection";
import PopularCategoriesSection from "./home/PopularCategoriesSection";
import LatestGuidesSection from "./home/LatestGuidesSection";

/* -----------------------------
   1. Data Fetching Functions
------------------------------ */

// 1. Editor's Pick Recipes
async function getEditorsPickRecipes() {
  return prisma.recipe.findMany({
    where: { isEditorsPick: true },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

// 2. Latest Recipes
async function getLatestRecipes() {
  return prisma.recipe.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

// 3. Popular Categories
async function getPopularCategories() {
  // Example: sort by recipesCount descending
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

// 4. Latest Guides
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

/* -----------------------------------
   2. The Home Page Server Component
------------------------------------ */

export default async function HomePage() {
  // Fetch all data in parallel
  const [editorsPickRecipes, latestRecipes, popularCategories, latestGuides] =
    await Promise.all([
      getEditorsPickRecipes(),
      getLatestRecipes(),
      getPopularCategories(),
      getLatestGuides(),
    ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ===== Hero Section (Imported) ===== */}
      <HeroSection />

      {/* ===== Editor's Picks ===== */}
      <EditorsPickSection recipes={editorsPickRecipes} />

      {/* ===== Latest Recipes ===== */}
      <LatestRecipesSection recipes={latestRecipes} title="Resepi Terkini" />

      {/* ===== Newsletter Section ===== */}
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

      {/* ===== Popular Categories ===== */}
      <PopularCategoriesSection categories={popularCategories} />

      {/* ===== Latest Guides ===== */}
      <LatestGuidesSection guides={latestGuides} />
    </div>
  );
}
