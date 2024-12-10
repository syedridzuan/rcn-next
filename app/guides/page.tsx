import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Fetch guides from the database
async function getGuides() {
  return await prisma.guide.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
    },
  });
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Guides</CardTitle>
        </CardHeader>
        <CardContent>
          {guides.length === 0 ? (
            <p className="text-gray-500">No guides found.</p>
          ) : (
            <ul className="space-y-4">
              {guides.map((guide) => (
                <li
                  key={guide.id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {guide.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Created at: {new Date(guide.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
