import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NewsletterForm from "@/components/NewsletterForm";

async function getRecipes() {
  return await prisma.recipe.findMany({
    take: 12,
    include: {
      category: true,
      user: {
        select: {
          name: true,
        },
      },
      images: {
        where: {
          isPrimary: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getTopCategories() {
  return await prisma.category.findMany({
    take: 6,
    orderBy: {
      recipes: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: { recipes: true },
      },
    },
  });
}

async function getLatestGuides() {
  return await prisma.guide.findMany({
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
    },
  });
}

async function getEditorsPickRecipes() {
  return await prisma.recipe.findMany({
    where: { isEditorsPick: true },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: {
        where: { isPrimary: true },
      },
    },
  });
}
export default async function HomePage() {
  const [recipes, topCategories, latestGuides, editorsPicks] =
    await Promise.all([
      getRecipes(),
      getTopCategories(),
      getLatestGuides(),
      getEditorsPickRecipes(),
    ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Resepi Teruji, Masak dengan Yakin bersama Che Nom
        </h1>
        <p className="text-xl mb-8">
          Cipta hidangan terbaik dengan resepi berkualiti yang pasti menjadi.
        </p>
        <Button size="lg">Terokai Resipi</Button>
      </section>

      {/* Editor's Picks Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Resepi Pilihan Editor</h2>
        {editorsPicks.length === 0 ? (
          <p className="text-gray-500">Tiada resepi pilihan buat masa ini.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {editorsPicks.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/resepi/${recipe.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                  {recipe.images[0] && (
                    <div className="aspect-video relative">
                      <Image
                        src={recipe.images[0].mediumUrl}
                        alt={recipe.images[0].alt || recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2 group-hover:text-orange-600 transition-colors duration-300">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {recipe.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {recipe.category.name}
                      </span>
                      <span>{recipe.cookTime + recipe.prepTime} minit</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Recipes Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Resepi Terkini</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/resepi/${recipe.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                {recipe.images[0] && (
                  <div className="aspect-video relative">
                    <Image
                      src={recipe.images[0].mediumUrl}
                      alt={recipe.images[0].alt || recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-orange-600 transition-colors duration-300">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {recipe.shortDescription}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {recipe.category.name}
                    </span>
                    <span>{recipe.cookTime + recipe.prepTime} minit</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-orange-100 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Langgan Surat Berita Kami
        </h2>
        <p className="text-center mb-6">
          Dapatkan resipi terbaru dan panduan memasak terus ke peti masuk anda!
        </p>
        <NewsletterForm />
      </section>

      {/* Popular Categories Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Kategori Popular</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topCategories.map((category) => (
            <Card key={category.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <CardDescription>
                  {category._count.recipes} Resepi
                </CardDescription>
              </CardHeader>
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
      </section>

      {/* Latest Guides Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Panduan Terkini</h2>
        {latestGuides.length === 0 ? (
          <p className="text-gray-500">Tiada panduan ditemui.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestGuides.map((guide) => (
              <Card key={guide.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>
                    Dicipta pada:{" "}
                    {new Date(guide.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Link href={`/guides/${guide.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Lihat Panduan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
