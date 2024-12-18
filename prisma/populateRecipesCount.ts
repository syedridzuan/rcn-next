// prisma/seed.ts
import { prisma } from '../lib/db' // Adjust import based on your project structure

async function main() {
  // Run your existing seeding logic if any

  // Populate recipesCount for categories
  const categories = await prisma.category.findMany()
  for (const cat of categories) {
    const count = await prisma.recipe.count({ where: { categoryId: cat.id } })
    await prisma.category.update({
      where: { id: cat.id },
      data: { recipesCount: count }
    })
  }

  console.log('recipesCount populated for all categories.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
