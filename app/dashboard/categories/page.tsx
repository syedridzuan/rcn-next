import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const revalidate = 0; // Disable caching for real-time data if desired

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Categories</CardTitle>
          <Link href="/dashboard/add-category">
            <Button>Add New Category</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <ScrollArea className="w-full h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left [&>th]:text-sm [&>th]:font-medium [&>th]:text-gray-700 bg-gray-100 border-b border-gray-200">
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-b [&>tr]:border-gray-200">
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="[&>td]:px-4 [&>td]:py-2 [&>td]:text-sm [&>td]:text-gray-700"
                    >
                      <td>{cat.name}</td>
                      <td>{cat.slug}</td>
                      <td>{cat.description || "-"}</td>
                      <td>{new Date(cat.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
