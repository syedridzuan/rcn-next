// lib/recipes.ts
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { Prisma } from "@prisma/client";

export type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    sections: {
      include: {
        items: true;
      };
    };
    comments: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
    category: true;
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
  };
}>;

export const getRecipe = cache(
  async (slug: string): Promise<RecipeWithRelations | null> => {
    try {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!recipe) {
        return null;
      }

      return recipe;
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return null;
    }
  }
);
