import { prisma } from './prisma';
import sharp from 'sharp';
import { FileManager, FileMetadata } from './utils/file-manager';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  alt?: string;
}

export interface ProcessedImage {
  url: string;
  alt?: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export class ImageService {
  private readonly fileManager: FileManager;

  constructor() {
    this.fileManager = new FileManager();
  }

  private getMimeTypeFromFilename(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  private async generateImageVersions(buffer: Buffer, filename: string) {
    const versions = {
      original: await this.optimizeImage(buffer, {
        quality: 90,
        format: 'jpeg'
      }),
      medium: await this.optimizeImage(buffer, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'jpeg'
      }),
      thumbnail: await this.optimizeImage(buffer, {
        width: 200,
        height: 200,
        quality: 80,
        format: 'jpeg'
      })
    };

    const fileManager = this.fileManager;
    const saveVersions = async () => {
      const paths = {
        original: await fileManager.saveFile(
          versions.original.data,
          `original-${filename}`
        ),
        medium: await fileManager.saveFile(
          versions.medium.data,
          `medium-${filename}`
        ),
        thumbnail: await fileManager.saveFile(
          versions.thumbnail.data,
          `thumbnail-${filename}`
        )
      };

      return {
        url: `/uploads/recipes/original-${filename}`,
        mediumUrl: `/uploads/recipes/medium-${filename}`,
        thumbnailUrl: `/uploads/recipes/thumbnail-${filename}`
      };
    };

    return await saveVersions();
  }

  async processAndSaveImage(
    file: File,
    recipeId: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    // Validate file
    const metadata: FileMetadata = {
      originalName: file.name,
      size: file.size,
      mimeType: file.type || this.getMimeTypeFromFilename(file.name),
      extension: '.' + file.name.split('.').pop()!.toLowerCase(),
    };
    this.fileManager.validateFile(metadata);
    
    // Process image
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = this.fileManager.generateUniqueFilename(file.name, recipeId);
    
    // Generate and save all versions
    const imagePaths = await this.generateImageVersions(buffer, filename);

    // Save to database
    const recipeImage = await prisma.$transaction(async (tx) => {
      return tx.recipeImage.create({
        data: {
          url: imagePaths.url,
          mediumUrl: imagePaths.mediumUrl,
          thumbnailUrl: imagePaths.thumbnailUrl,
          alt: options.alt,
          recipeId,
          isPrimary: false,
        },
      });
    });

    const imageInfo = await sharp(buffer).metadata();

    if (!imageInfo.width || !imageInfo.height || !imageInfo.format) {
      throw new Error('Failed to process image metadata');
    }

    return {
      url: recipeImage.url,
      mediumUrl: recipeImage.mediumUrl,
      thumbnailUrl: recipeImage.thumbnailUrl,
      alt: recipeImage.alt || undefined,
      width: imageInfo.width,
      height: imageInfo.height,
      format: imageInfo.format,
      size: buffer.length,
    };
  }

  private async optimizeImage(
    buffer: Buffer,
    options: ImageProcessingOptions
  ): Promise<{ data: Buffer; info: sharp.Metadata }> {
    const image = sharp(buffer);

    if (options.width || options.height) {
      image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (options.format) {
      image.toFormat(options.format, {
        quality: options.quality || 80,
      });
    }

    const data = await image.toBuffer();
    const info = await image.metadata();

    return { data, info };
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await prisma.$transaction(async (tx) => {
      const img = await tx.recipeImage.findUnique({
        where: { id: imageId },
      });

      if (!img) {
        throw new Error('Image not found');
      }

      await tx.recipeImage.delete({
        where: { id: imageId },
      });

      return img;
    });

    try {
      // Delete all versions
      await Promise.all([
        this.fileManager.deleteFile(image.url),
        this.fileManager.deleteFile(image.mediumUrl),
        this.fileManager.deleteFile(image.thumbnailUrl),
      ]);
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  }

  async setPrimaryImage(imageId: string, recipeId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Reset all images to non-primary
      await tx.recipeImage.updateMany({
        where: { recipeId },
        data: { isPrimary: false },
      });

      // Set the selected image as primary
      await tx.recipeImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }
} 