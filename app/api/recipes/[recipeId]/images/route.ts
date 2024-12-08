import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

// Helper function to save file
async function saveFile(file: File, filename: string): Promise<void> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure the directory exists
  const dir = path.join(process.cwd(), 'public/images/recipes');
  
  // Save the file
  const filePath = path.join(dir, filename);
  await writeFile(filePath, buffer);
}

// Helper function to delete file
async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public/images/recipes', filename);
  try {
    await unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue even if file doesn't exist
  }
}

// POST /api/recipes/[recipeId]/images
export async function POST(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${params.recipeId}-${timestamp}.${extension}`;

    // Save file to public directory
    await saveFile(file, filename);

    // Create URLs for different sizes
    const url = `/images/recipes/${filename}`;
    const mediumUrl = `/images/recipes/${filename}`; // For now, using same file
    const thumbnailUrl = `/images/recipes/${filename}`; // For now, using same file

    // Save to database
    const image = await prisma.recipeImage.create({
      data: {
        recipeId: params.recipeId,
        url,
        mediumUrl,
        thumbnailUrl,
        alt: alt || undefined,
        isPrimary: false
      }
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// GET /api/recipes/[recipeId]/images
export async function GET(
  _req: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const recipeId = resolvedParams.recipeId;

    const images = await prisma.recipeImage.findMany({
      where: { recipeId },
      orderBy: { isPrimary: 'desc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[recipeId]/images
export async function DELETE(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const imageId = request.nextUrl.searchParams.get('imageId');
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'No image ID provided' },
        { status: 400 }
      );
    }

    // Get the image record first
    const image = await prisma.recipeImage.findUnique({
      where: {
        id: imageId,
        recipeId: params.recipeId
      }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the image record from database
    await prisma.recipeImage.delete({
      where: {
        id: imageId,
        recipeId: params.recipeId
      }
    });

    // Extract filename from URL and delete the file
    const filename = path.basename(image.url);
    await deleteFile(filename);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// PATCH /api/recipes/[recipeId]/images
export async function PATCH(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const imageId = request.nextUrl.searchParams.get('imageId');
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const { action } = await request.json();
    if (action !== 'setPrimary') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify the image exists and belongs to this recipe
    const image = await prisma.recipeImage.findUnique({
      where: {
        id: imageId,
        recipeId: params.recipeId
      }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction([
      // First, set all images for this recipe as non-primary
      prisma.recipeImage.updateMany({
        where: {
          recipeId: params.recipeId
        },
        data: {
          isPrimary: false
        }
      }),
      // Then, set the selected image as primary
      prisma.recipeImage.update({
        where: {
          id: imageId,
          recipeId: params.recipeId
        },
        data: {
          isPrimary: true
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
} 