import { prisma } from '../lib/db';
import { ImageService } from '../lib/image-service';
import { FileManager } from '../lib/utils/file-manager';

async function processExistingImages() {
  const imageService = new ImageService();
  const fileManager = new FileManager();

  // Get all images
  const images = await prisma.recipeImage.findMany();

  for (const image of images) {
    try {
      // Get the original image file
      const filePath = fileManager.getAbsolutePathFromUrl(image.url);
      const buffer = await fs.promises.readFile(filePath);

      // Generate new versions
      const filename = image.url.split('/').pop()!;
      const versions = await imageService.generateImageVersions(buffer, filename);

      // Update database record
      await prisma.recipeImage.update({
        where: { id: image.id },
        data: {
          mediumUrl: versions.mediumUrl,
          thumbnailUrl: versions.thumbnailUrl,
        },
      });

      console.log(`Processed image: ${image.id}`);
    } catch (error) {
      console.error(`Failed to process image ${image.id}:`, error);
    }
  }
}

processExistingImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 