// scripts/count-users-recipe.ts

import { prisma } from "../lib/db"

async function main() {
  console.log("Starting recipeCount update for all users...")

  // 1. Fetch all users along with their recipes
  const users = await prisma.user.findMany({
    include: {
      recipes: true,
    },
  })

  // 2. For each user, calculate the number of recipes
  for (const user of users) {
    const recipeCount = user.recipes.length

    // 3. Update the user's recipeCount
    await prisma.user.update({
      where: { id: user.id },
      data: {
        recipeCount: recipeCount,
      },
    })

    console.log(`Updated user "${user.id}" => recipeCount = ${recipeCount}`)
  }

  console.log("All users have been updated with correct recipeCount!")
}

main()
  .catch((error) => {
    console.error("An error occurred while updating recipeCount:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })