import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  // Delete in correct order (child tables first)
  await prisma.recipeItem.deleteMany({});
  await prisma.recipeSection.deleteMany({});
  await prisma.recipeImage.deleteMany({});
  await prisma.recipeTip.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Main Dishes",
        slug: "main-dishes",
        description: "Hearty main courses for any occasion",
      },
    }),
    prisma.category.create({
      data: {
        name: "Desserts",
        slug: "desserts",
        description: "Sweet treats and desserts",
      },
    }),
    prisma.category.create({
      data: {
        name: "Breakfast",
        slug: "breakfast",
        description: "Start your day right",
      },
    }),
  ]);

  // Create basic recipes
  const recipes = [
    {
      title: "Nasi Goreng",
      description: "Classic Malaysian fried rice",
      language: "ms",
      cookTime: 15,
      prepTime: 10,
      servings: 2,
      difficulty: "EASY",
      categoryId: categories[0].id,
      images: [
        {
          url: "/images/recipes/nasi-goreng.jpg",
          mediumUrl: "/images/recipes/nasi-goreng-medium.jpg",
          thumbnailUrl: "/images/recipes/nasi-goreng-thumbnail.jpg",
          alt: "Nasi Goreng",
          isPrimary: true,
        },
      ],
      sections: [
        {
          title: "Bahan-bahan",
          type: "INGREDIENTS",
          items: [
            "2 piring nasi sejuk",
            "2 biji telur",
            "2 ulas bawang putih",
            "Kicap",
          ],
        },
        {
          title: "Cara Memasak",
          type: "INSTRUCTIONS",
          items: [
            "Tumis bawang putih",
            "Masukkan telur dan nasi",
            "Tambah kicap dan garam",
          ],
        },
      ],
      tips: [
        "Gunakan nasi sejuk untuk hasil yang lebih baik",
        "Jangan terlalu banyak kicap",
      ],
    },
    {
      title: "Simple Pancakes",
      description: "Fluffy breakfast pancakes",
      language: "en",
      cookTime: 15,
      prepTime: 5,
      servings: 4,
      difficulty: "EASY",
      categoryId: categories[2].id,
      images: [
        {
          url: "/images/recipes/pancakes.jpg",
          mediumUrl: "/images/recipes/pancakes-medium.jpg",
          thumbnailUrl: "/images/recipes/pancakes-thumbnail.jpg",
          alt: "Pancakes",
          isPrimary: true,
        },
      ],
      sections: [
        {
          title: "Ingredients",
          type: "INGREDIENTS",
          items: ["1 cup flour", "1 cup milk", "1 egg", "1 tbsp sugar"],
        },
        {
          title: "Instructions",
          type: "INSTRUCTIONS",
          items: [
            "Mix all ingredients",
            "Heat pan on medium",
            "Cook until bubbles form",
          ],
        },
      ],
      tips: ["Don't overmix the batter", "Let batter rest for 5 minutes"],
    },
  ];

  // Create recipes with all related data
  for (const recipeData of recipes) {
    await prisma.recipe.create({
      data: {
        title: recipeData.title,
        slug: generateSlug(recipeData.title),
        description: recipeData.description,
        language: recipeData.language,
        cookTime: recipeData.cookTime,
        prepTime: recipeData.prepTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        categoryId: recipeData.categoryId,
        userId: admin.id,
        images: {
          create: recipeData.images,
        },
        sections: {
          create: recipeData.sections.map((section) => ({
            title: section.title,
            type: section.type,
            items: {
              create: section.items.map((content) => ({
                content,
              })),
            },
          })),
        },
        tips: {
          create: recipeData.tips.map((content) => ({
            content,
          })),
        },
      },
    });
  }

  console.log("Database has been seeded! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
