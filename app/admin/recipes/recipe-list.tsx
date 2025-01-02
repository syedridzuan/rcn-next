"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

/* -------------------------------------------------------------
   1) A helper to safely format dates and avoid "Invalid time value."
   ------------------------------------------------------------- */
function safeFormatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) {
    return "N/A";
  }
  const dateObj =
    typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (isNaN(dateObj.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

/* -------------------------------------------------------------
   2) Recipe-related interfaces & props
   ------------------------------------------------------------- */
interface RecipeImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  category?: {
    name: string | null;
  } | null;
  difficulty: string; // e.g., 'EASY'
  status: string; // e.g., 'PUBLISHED'
  createdAt: string | Date;
  updatedAt: string | Date;
  isEditorsPick: boolean;
  images?: RecipeImage[];
}

/** Sorting keys available: "createdAt" or "updatedAt" */
type SortKey = "createdAt" | "updatedAt" | "";

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const router = useRouter();

  // ====== SEARCH & FILTER STATES ======
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ====== SORTING STATES ======
  const [sortKey, setSortKey] = useState<SortKey>(""); // '' means no active sort
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ====== PAGINATION STATES ======
  const PAGE_SIZE = 10; // example page size
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------------------------------------
     3) Build a list of unique category names from the data
     ------------------------------------------------------------- */
  const categoryOptions = useMemo(() => {
    const setOfCats = new Set<string>();
    recipes.forEach((r) => {
      if (r.category?.name) {
        setOfCats.add(r.category.name);
      }
    });
    return Array.from(setOfCats).sort(); // sorted category names
  }, [recipes]);

  /* -------------------------------------------------------------
     4) FILTER + SEARCH
     ------------------------------------------------------------- */
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return recipes.filter((recipe) => {
      // (a) Text search on title or category name
      if (q) {
        const catName = recipe.category?.name?.toLowerCase() || "";
        const title = recipe.title.toLowerCase();
        if (!title.includes(q) && !catName.includes(q)) {
          return false;
        }
      }
      // (b) Category filter
      if (filterCategory) {
        const catName = recipe.category?.name || "";
        if (catName !== filterCategory) {
          return false;
        }
      }
      // (c) Status filter
      if (filterStatus && recipe.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [recipes, searchQuery, filterCategory, filterStatus]);

  /* -------------------------------------------------------------
     5) SORTING
     ------------------------------------------------------------- */
  const sortedRecipes = useMemo(() => {
    if (!sortKey) {
      // No sort
      return filteredRecipes;
    }
    return [...filteredRecipes].sort((a, b) => {
      const aDate = new Date(a[sortKey]);
      const bDate = new Date(b[sortKey]);
      if (aDate.getTime() === bDate.getTime()) return 0;
      const compare = aDate.getTime() - bDate.getTime();
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredRecipes, sortKey, sortOrder]);

  /* -------------------------------------------------------------
     6) PAGINATION
     ------------------------------------------------------------- */
  const totalItems = sortedRecipes.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedRecipes.slice(start, end);
  }, [sortedRecipes, currentPage]);

  function goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  }

  // RENDER
  return (
    <div>
      {/* SEARCH & FILTER UI */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search input */}
        <Input
          placeholder="Search recipes..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to page 1
          }}
        />

        {/* Category filter */}
        <select
          className="border rounded px-2 py-1"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1); // Reset pagination
          }}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className="border rounded px-2 py-1"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="HIDDEN">HIDDEN</option>
        </select>

        {/* Sort Key */}
        <select
          className="border rounded px-2 py-1"
          value={sortKey}
          onChange={(e) => {
            setSortKey(e.target.value as SortKey);
            setCurrentPage(1);
          }}
        >
          <option value="">No Sort</option>
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
        </select>

        {/* Sort Order */}
        <select
          className="border rounded px-2 py-1"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as "asc" | "desc");
            setCurrentPage(1);
          }}
        >
          <option value="asc">ASC</option>
          <option value="desc">DESC</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Difficulty</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Created At</th>
              <th className="p-3 font-medium">Updated At</th>
              <th className="p-3 font-medium">Editor’s Pick</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((recipe) => (
              <RecipeRow key={recipe.id} recipe={recipe} />
            ))}
            {currentPageData.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No matching recipes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
   7) A single row (for each recipe)
   ------------------------------------------------------------- */
function RecipeRow({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useState(false); // simplified example

  async function handleDelete() {
    startTransition(true);
    try {
      // Suppose you have a deleteRecipe function
      const { deleteRecipe } = await import("./actions"); // dynamic import
      await deleteRecipe(recipe.id);
      toast.success("Recipe deleted successfully");
      // Optionally refresh or remove from state
    } catch {
      toast.error("Failed to delete recipe");
    } finally {
      startTransition(false);
    }
  }

  // Safely format
  const categoryName = recipe.category?.name || "—";
  const createdAtString = safeFormatDate(recipe.createdAt);
  const updatedAtString = safeFormatDate(recipe.updatedAt);

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="p-3">
        <div className="flex items-center gap-2">
          {recipe.title}
          {recipe.isEditorsPick && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
              Editor's Pick
            </span>
          )}
        </div>
      </td>
      <td className="p-3">{categoryName}</td>
      <td className="p-3">{recipe.difficulty}</td>
      <td className="p-3">{recipe.status}</td>
      <td className="p-3">{createdAtString}</td>
      <td className="p-3">{updatedAtString}</td>
      <td className="p-3">
        {recipe.isEditorsPick ? (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            Yes
          </span>
        ) : (
          <span className="text-xs text-gray-500">No</span>
        )}
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/resepi/${recipe.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Link href={`/admin/recipes/${recipe.id}/images`}>
            <Button variant="outline" size="sm">
              Images
            </Button>
          </Link>
          <Link href={`/admin/recipes/${recipe.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this recipe? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                  {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}
