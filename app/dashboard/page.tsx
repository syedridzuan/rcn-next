import Link from "next/link";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export default async function adminPage() {
  const session = await auth();

  // Authorization check
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    // Option 1: Show a 404 page
    // notFound()

    // Option 2: Redirect to sign in or a "no access" page
    redirect("/auth/signin");
  }

  const sections = [
    { href: "/admin/categories", title: "Categories" },
    { href: "/admin/guides", title: "Guides" },
    { href: "/admin/newsletter", title: "Newsletter" },
    { href: "/admin/recipes", title: "Recipes" },
    { href: "/admin/tags", title: "Tags" },
  ];

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">admin</h1>
      <p className="text-gray-700">
        Welcome to your admin. Please select a section to manage:
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-6">
        {sections.map((sec) => (
          <Card key={sec.href} className="flex flex-col items-start">
            <CardHeader>
              <CardTitle>{sec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={sec.href}>
                <Button variant="outline">Go to {sec.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
