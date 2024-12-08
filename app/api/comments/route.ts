import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60000, // 1 minute
      max: 5 // 5 requests per minute
    })
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    console.log('Received comment request')
    
    const session = await auth()
    console.log('Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { content, recipeId } = body

    if (!content?.trim()) {
      console.log('Content missing')
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!recipeId) {
      console.log('RecipeId missing')
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })

    if (!recipe) {
      console.log('Recipe not found:', recipeId)
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    console.log('Found recipe:', recipe)

    console.log('Creating comment with:', {
      content,
      recipeId,
      userId: session.user.id
    })

    const comment = await prisma.comment.create({
      data: {
        content,
        recipeId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    console.log('Created comment:', comment)
    return NextResponse.json(comment)
  } catch (error: any) {
    console.error('Failed to create comment. Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    })
    
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60000, // 1 minute
      max: 10 // 10 deletions per minute
    })
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const commentId = url.searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Find the comment first to check ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if the user is the owner of the comment
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this comment' },
        { status: 403 }
      )
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 