// file: @/lib/buildRecipeText.ts
import type { RecipeSection, RecipeItem, Category, Tag } from "@prisma/client";

/**
 * Extend or define a joined recipe interface as needed.
 * Example shape for a fully-joined recipe:
 */
interface JoinedRecipe {
  id: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  category?: Category | null;
  sections?: (RecipeSection & {
    items?: RecipeItem[];
  })[];
  tips?: { content: string }[];
  tags?: Tag[];
}

/**
 * Utility function to build a plain-text representation of a recipe,
 * labeling sections based on `section.type` if available.
 */
export function buildRecipeText(recipe: JoinedRecipe): string {
  const lines: string[] = [];

  // 1. Title & descriptions
  lines.push(`Judul Resipi: ${recipe.title}`);

  if (recipe.description) {
    lines.push(`Penerangan: ${recipe.description}`);
  }

  if (recipe.shortDescription) {
    lines.push(`Ringkasan: ${recipe.shortDescription}`);
  }

  // 2. Category (if loaded)
  if (recipe.category?.name) {
    lines.push(`Kategori: ${recipe.category.name}`);
  }

  // 3. Sections & items
  if (recipe.sections && recipe.sections.length > 0) {
    lines.push(`\nBahagian Resipi:\n------------------`);

    for (const section of recipe.sections) {
      // Decide on a heading label based on `section.type`
      let headingLabel: string | null = null;

      switch (section.type) {
        case "INGREDIENTS":
          headingLabel = "Bahan-Bahan";
          break;
        case "INSTRUCTIONS":
          headingLabel = "Cara-Cara";
          break;
        default:
          // If type is unknown, fallback to section.title or a generic label
          headingLabel = section.title ? section.title : "Bahagian Tanpa Tajuk";
          break;
      }

      // If you also want to display the user-defined title in parentheses:
      // For example: "Bahan-Bahan (Bahan Utama)"
      //   if section.title differs from type-based label
      if (
        section.title &&
        section.title !== "Bahan Utama" && // or any other logic
        section.title !== "Penyediaan Utama"
      ) {
        headingLabel += ` (${section.title})`;
      }

      lines.push(`\n${headingLabel}:`);

      // List out items
      if (section.items?.length) {
        for (const item of section.items) {
          lines.push(`- ${item.content}`);
        }
      } else {
        lines.push("(Tiada maklumat untuk bahagian ini)");
      }
    }
  }

  // 4. Tips
  if (recipe.tips && recipe.tips.length > 0) {
    lines.push(`\nPetua / Tips:\n------------------`);
    for (const tip of recipe.tips) {
      lines.push(`- ${tip.content}`);
    }
  }

  // 5. Tags
  if (recipe.tags && recipe.tags.length > 0) {
    const tagNames = recipe.tags.map((tag) => tag.name).join(", ");
    lines.push(`\nTags: ${tagNames}`);
  }

  return lines.join("\n");
}
