// scripts/updateEnumValues.ts
import { prisma } from '@/lib/db'

async function main() {
  // Update 'INGREDIENT' to 'INGREDIENTS'
  const ingResult = await prisma.recipeSection.updateMany({
    where: { type: 'INGREDIENT' },
    data: { type: 'INGREDIENTS' }
  })

  // Update 'DIRECTION' to 'INSTRUCTIONS'
  const dirResult = await prisma.recipeSection.updateMany({
    where: { type: 'DIRECTION' },
    data: { type: 'INSTRUCTIONS' }
  })

  console.log(`Updated ${ingResult.count} sections from INGREDIENT to INGREDIENTS.`)
  console.log(`Updated ${dirResult.count} sections from DIRECTION to INSTRUCTIONS.`)

  console.log("Enum value updates completed successfully!")
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
