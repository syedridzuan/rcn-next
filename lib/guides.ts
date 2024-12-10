import { prisma } from "@/lib/db";

/**
 * Retrieves a guide by its slug with all related data
 * @param slug The unique slug identifier for the guide
 * @returns The guide with all related fields or null if not found
 */
export async function getGuideBySlug(slug: string) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: {
      tags: true,
      author: true,
      sections: true,
      images: true,
      comments: {
        include: {
          user: true
        }
      }
    }
  });

  return guide; // returns the full Guide object with related fields or null if not found
}
