'use server'

import { prisma } from "@/lib/db"

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    },
    select: {
      name: true,
      slug: true,
    }
  })

  return categories.map(category => ({
    label: category.name,
    href: `/resepi/kategori/${category.slug}`
  }))
} 