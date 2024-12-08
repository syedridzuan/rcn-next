import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const maxCookTime = searchParams.get('maxCookTime')
  const language = searchParams.get('language')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12

  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
    AND: [
      category ? { categoryId: category } : {},
      difficulty ? { difficulty } : {},
      maxCookTime ? { cookTime: { lte: parseInt(maxCookTime) } } : {},
      language ? { language } : {},
    ],
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.recipe.count({ where }),
  ])

  return Response.json({
    items: recipes,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  })
} 