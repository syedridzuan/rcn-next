"use client";

import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  RecipeDifficulty,
  RecipeStatus,
  ServingType,
} from "@prisma/client";

interface Category {
  id: string;
  name: string;
}

interface RecipeItem {
  id: string;
  slug: string;
  title: string;
  cookTime: number;
  prepTime: number;
  totalTime: number | null;
  servings: number;
  servingType: ServingType | null;
  difficulty: RecipeDifficulty;
  status: RecipeStatus;
  updatedAt?: string;
  categoryId?: string;
  publishedAt?: string | null;
}

interface RecipeMetaAdminProps {
  initialRecipes: RecipeItem[];
  categories: Category[];
}

export function RecipeMetaAdmin({
  initialRecipes,
  categories,
}: RecipeMetaAdminProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Local state for all recipes
  const [recipes, setRecipes] = useState<RecipeItem[]>(initialRecipes);

  // ---- NEW: Track which rows are “dirty” (unsaved changes)
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<string>>(new Set());

  // ========== FILTER STATES =========
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<RecipeStatus | "">("");
  const [filterDifficulty, setFilterDifficulty] = useState<
    RecipeDifficulty | ""
  >("");
  const [filterServingType, setFilterServingType] = useState<string>("");
  const [filterMissingMeta, setFilterMissingMeta] = useState(false);

  // ========== Derived “filteredRecipes” with dirty-row skip =========
  const filteredRecipes = useMemo(() => {
    const titleFilter = filterTitle.toLowerCase().trim();

    return recipes.filter((r) => {
      // 0) If row is dirty, skip all filtering => always show
      if (dirtyRowIds.has(r.id)) {
        return true;
      }

      // 1) Title filter
      if (titleFilter && !r.title.toLowerCase().includes(titleFilter)) {
        return false;
      }

      // 2) Category filter
      if (filterCategory && r.categoryId !== filterCategory) {
        return false;
      }

      // 3) Status filter
      if (filterStatus && r.status !== filterStatus) {
        return false;
      }

      // 4) Difficulty filter
      if (filterDifficulty && r.difficulty !== filterDifficulty) {
        return false;
      }

      // 5) Serving Type filter
      if (filterServingType) {
        // If user selected “no serving type” => only match recipes where servingType is null
        if (filterServingType === "__NULL__") {
          if (r.servingType !== null) {
            return false;
          }
        } else {
          if (r.servingType !== filterServingType) {
            return false;
          }
        }
      }

      // 6) Missing meta filter
      if (filterMissingMeta) {
        const noCategory = !r.categoryId;
        const noCookTime = !r.cookTime || r.cookTime <= 0;
        const noPrepTime = !r.prepTime || r.prepTime <= 0;
        const noTotalTime = !r.totalTime || r.totalTime <= 0;
        const missing = noCategory || noCookTime || noPrepTime || noTotalTime;
        if (!missing) {
          return false;
        }
      }

      return true;
    });
  }, [
    recipes,
    filterTitle,
    filterCategory,
    filterStatus,
    filterDifficulty,
    filterServingType,
    filterMissingMeta,
    dirtyRowIds,
  ]);

  // ========== handleChange() for inline editing =========
  function handleChange(
    recipeId: string,
    field: keyof RecipeItem,
    value: string | number
  ) {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          // Mark row as “dirty” so it remains visible despite filtering
          setDirtyRowIds((oldSet) => {
            const newSet = new Set(oldSet);
            newSet.add(recipeId);
            return newSet;
          });

          // Convert numeric fields
          if (
            field === "cookTime" ||
            field === "prepTime" ||
            field === "totalTime" ||
            field === "servings"
          ) {
            return { ...r, [field]: Number(value) };
          } else {
            return { ...r, [field]: value };
          }
        }
        return r;
      })
    );
  }

  // ========== handleSave() to persist changes to backend =========
  async function handleSave(recipe: RecipeItem) {
    try {
      const resp = await fetch(`/admin/api/recipes/metas/${recipe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookTime: recipe.cookTime,
          prepTime: recipe.prepTime,
          totalTime: recipe.totalTime,
          servings: recipe.servings,
          servingType: recipe.servingType,
          difficulty: recipe.difficulty,
          status: recipe.status,
          categoryId: recipe.categoryId,
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        toast({
          title: "Ralat Menyimpan",
          description: errorText || "Failed to save changes.",
          variant: "destructive",
        });
        return;
      }

      // If success, remove from dirty set
      setDirtyRowIds((oldSet) => {
        const newSet = new Set(oldSet);
        newSet.delete(recipe.id);
        return newSet;
      });

      toast({
        title: "Berjaya Disimpan",
        description: "Maklumat resepi telah dikemas kini.",
      });
    } catch (error: any) {
      toast({
        title: "Ralat Menyimpan",
        description: error?.message ?? "Error saving recipe changes.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* ========== FILTER UI ========== */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Title Filter */}
        <div className="flex flex-col">
          <label htmlFor="filterTitle" className="text-sm font-medium">
            Cari Berdasarkan Title
          </label>
          <input
            id="filterTitle"
            type="text"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            placeholder="Contoh: Nasi Lemak..."
            className="border px-2 py-1 rounded"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <label htmlFor="filterCategory" className="text-sm font-medium">
            Pilih Kategori
          </label>
          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <label htmlFor="filterStatus" className="text-sm font-medium">
            Status Resepi
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as RecipeStatus | "")
            }
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="HIDDEN">HIDDEN</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-col">
          <label htmlFor="filterDifficulty" className="text-sm font-medium">
            Tahap Kesukaran
          </label>
          <select
            id="filterDifficulty"
            value={filterDifficulty}
            onChange={(e) =>
              setFilterDifficulty(e.target.value as RecipeDifficulty | "")
            }
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
            <option value="EXPERT">EXPERT</option>
          </select>
        </div>

        {/* Serving Type Filter */}
        <div className="flex flex-col">
          <label htmlFor="filterServingType" className="text-sm font-medium">
            Serving Type
          </label>
          <select
            id="filterServingType"
            value={filterServingType}
            onChange={(e) => setFilterServingType(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua</option>
            <option value="__NULL__">(Tiada / None)</option>
            <option value="PEOPLE">PEOPLE</option>
            <option value="SLICES">SLICES</option>
            <option value="PIECES">PIECES</option>
            <option value="PORTIONS">PORTIONS</option>
            <option value="BOWLS">BOWLS</option>
            <option value="GLASSES">GLASSES</option>
          </select>
        </div>

        {/* (Optional) Missing Data Filter */}
        <div className="flex items-center space-x-2 mt-2">
          <input
            id="filterMissingMeta"
            type="checkbox"
            checked={filterMissingMeta}
            onChange={(e) => setFilterMissingMeta(e.target.checked)}
          />
          <label htmlFor="filterMissingMeta" className="text-sm font-medium">
            Tunjuk Resepi Yang Tiada Kategori / CookTime / PrepTime / TotalTime
          </label>
        </div>
      </div>

      {/* ========== TABLE ========== */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Cook Time</th>
              <th className="p-2 border">Prep Time</th>
              <th className="p-2 border">Total Time</th>
              <th className="p-2 border">Servings</th>
              <th className="p-2 border">Serving Type</th>
              <th className="p-2 border">Difficulty</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
              <th className="p-2 border">View / Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.length < 1 ? (
              <tr>
                <td
                  colSpan={11}
                  className="p-4 text-center text-gray-500 italic"
                >
                  Tiada resipi dijumpai untuk penapis sekarang.
                </td>
              </tr>
            ) : (
              filteredRecipes.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {/* Title */}
                  <td className="p-2 border">{r.title}</td>

                  {/* Category */}
                  <td className="p-2 border">
                    <select
                      className="border rounded px-1"
                      value={r.categoryId ?? ""}
                      onChange={(e) =>
                        handleChange(r.id, "categoryId", e.target.value)
                      }
                    >
                      <option value="">(None)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Cook Time */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-20 border rounded px-1"
                      value={r.cookTime}
                      onChange={(e) =>
                        handleChange(r.id, "cookTime", e.target.value)
                      }
                    />
                  </td>

                  {/* Prep Time */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-20 border rounded px-1"
                      value={r.prepTime}
                      onChange={(e) =>
                        handleChange(r.id, "prepTime", e.target.value)
                      }
                    />
                  </td>

                  {/* Total Time */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-20 border rounded px-1"
                      value={r.totalTime ?? 0}
                      onChange={(e) =>
                        handleChange(r.id, "totalTime", e.target.value)
                      }
                    />
                  </td>

                  {/* Servings */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-20 border rounded px-1"
                      value={r.servings}
                      onChange={(e) =>
                        handleChange(r.id, "servings", e.target.value)
                      }
                    />
                  </td>

                  {/* Serving Type */}
                  <td className="p-2 border">
                    <select
                      className="border rounded px-1"
                      value={r.servingType ?? ""}
                      onChange={(e) =>
                        handleChange(r.id, "servingType", e.target.value)
                      }
                    >
                      <option value="">(None)</option>
                      <option value="PEOPLE">PEOPLE</option>
                      <option value="SLICES">SLICES</option>
                      <option value="PIECES">PIECES</option>
                      <option value="PORTIONS">PORTIONS</option>
                      <option value="BOWLS">BOWLS</option>
                      <option value="GLASSES">GLASSES</option>
                    </select>
                  </td>

                  {/* Difficulty */}
                  <td className="p-2 border">
                    <select
                      className="border rounded px-1"
                      value={r.difficulty}
                      onChange={(e) =>
                        handleChange(r.id, "difficulty", e.target.value)
                      }
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  </td>

                  {/* Status */}
                  <td className="p-2 border">
                    <select
                      className="border rounded px-1"
                      value={r.status}
                      onChange={(e) =>
                        handleChange(r.id, "status", e.target.value)
                      }
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="HIDDEN">HIDDEN</option>
                    </select>
                  </td>

                  {/* Save action */}
                  <td className="p-2 border whitespace-nowrap">
                    <button
                      onClick={() => handleSave(r)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </td>

                  {/* View / Edit actions */}
                  <td className="p-2 border text-center whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/resepi/${r.slug}`}
                        target="_blank"
                        className="px-2 py-1 text-sm text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/recipes/${r.id}/edit`}
                        className="px-2 py-1 text-sm text-green-700 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
