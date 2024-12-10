import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Helper function to ensure directory exists
async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    if ((error as any).code !== 'EEXIST') throw error
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { guideId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const alt = formData.get('alt') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Await params
    const resolvedParams = await Promise.resolve(params)
    const guideId = resolvedParams.guideId

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/images/guides', guideId)
    await ensureDir(uploadDir)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Create database record
    const image = await prisma.guideImage.create({
      data: {
        url: `/images/guides/${guideId}/${filename}`,
        alt: alt || null,
        guideId: guideId,
        isPrimary: false,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Failed to upload image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
} 