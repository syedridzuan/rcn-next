import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import CategoryList from "./category-list"
import AddCategoryButton from "./add-category-button"

export const revalidate = 0

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Categories</CardTitle>
          <AddCategoryButton />
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <CategoryList categories={categories} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
