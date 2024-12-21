// scripts/fix-tag-slugs.ts
import { prisma } from "@/lib/db"
import slugify from "slugify" // optional package to convert name to slug

async function fixTagSlugs() {
  // 1. Fetch all tags
  const allTags = await prisma.tag.findMany()

  // 2. For each tag, set a slug based on name (or any logic you prefer)
  for (const tag of allTags) {
    if (!tag.slug) {
      const newSlug = slugify(tag.name, { lower: true, strict: true })

      // Because slug must be unique, you might want to
      // handle duplicates by appending a counter, etc.
      // This is just an example.
      await prisma.tag.update({
        where: { id: tag.id },
        data: { slug: newSlug },
      })
    }
  }

  console.log("All existing tags have been assigned a slug.")
}

fixTagSlugs()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })