import { getAllRecipes, getAllCategories } from "@/lib/db";
import { Recipe } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

function parseDifficulty(difficulty: string): string | undefined {
  return difficulty === "ANY" ? undefined : difficulty;
}

function parseCategory(categoryId: string): string | undefined {
  return categoryId === "ALL" ? undefined : categoryId;
}

export default async function ResipiPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    difficulty?: string;
    categoryId?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};

  const pageParam = params.page ? parseInt(params.page, 10) : 1;
  const searchParam = params.search ?? "";
  const difficultyParam = params.difficulty ?? "";
  const categoryIdParam = params.categoryId ?? "";

  let categories = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  const finalDifficulty = parseDifficulty(difficultyParam);
  const finalCategory = parseCategory(categoryIdParam);

  const pageSize = 5;
  const { recipes, totalCount, currentPage } = await getAllRecipes({
    page: pageParam,
    pageSize,
    search: searchParam,
    difficulty: finalDifficulty,
    categoryId: finalCategory,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const createUrl = (overrides: Record<string, string | number>) => {
    const newQuery = new URLSearchParams({
      page: String(currentPage),
      search: searchParam,
      difficulty: difficultyParam,
      categoryId: categoryIdParam,
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, String(v)])
      ),
    });
    return `/resipi?${newQuery.toString()}`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Senarai Resipi</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Tapis Resipi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col sm:flex-row gap-4"
            action="/resipi"
            method="GET"
          >
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Cari resipi..."
                defaultValue={searchParam}
                className="w-full"
                icon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <Select defaultValue={difficultyParam} name="difficulty">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Kesukaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Semua</SelectItem>
                <SelectItem value="EASY">Mudah</SelectItem>
                <SelectItem value="MEDIUM">Sederhana</SelectItem>
                <SelectItem value="HARD">Sukar</SelectItem>
                <SelectItem value="EXPERT">Pakar</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={categoryIdParam} name="categoryId">
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="page" value="1" />
            <Button type="submit" className="w-full sm:w-auto">
              Tapis
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {recipes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Tiada resipi ditemui.</p>
            </CardContent>
          </Card>
        ) : (
          recipes.map((recipe: Recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.shortDescription && (
                  <p className="text-sm text-gray-600 mb-2">
                    {recipe.shortDescription}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={`/resepi/${recipe.slug}`}>Papar Perincian</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            asChild
            variant="outline"
            disabled={currentPage <= 1}
            className="flex items-center"
          >
            <Link href={createUrl({ page: currentPage - 1 })}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Link>
          </Button>

          <span className="text-sm text-gray-600">
            Halaman {currentPage} / {totalPages}
          </span>

          <Button
            asChild
            variant="outline"
            disabled={currentPage >= totalPages}
            className="flex items-center"
          >
            <Link href={createUrl({ page: currentPage + 1 })}>
              Seterusnya <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
