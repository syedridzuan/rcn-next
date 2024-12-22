// app/profil/[username]/page.tsx

import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { AuthorProfileCard } from "./ui/author-profile-card"

interface ProfilePageProps {
  params: { username: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Because we're in an async function, we need to await the destructuring:
  const { username } = await Promise.resolve(params)

  // Query the user by username:
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      recipeCount: true,
      instagramHandle: true,
      facebookHandle: true,
      tiktokHandle: true,
      blogUrl: true,
      // Order recipes by latest
      recipes: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: {
            where: { isPrimary: true },
            select: {
              url: true,
              alt: true,
            },
            take: 1,
          },
        },
        take: 6, // e.g., show up to 6
      },
    },
  })

  // If user not found, show a 404
  if (!user) {
    notFound()
  }

  // Render a user profile
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profil Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorProfileCard user={user} />
        </CardContent>
      </Card>

      {/* Show user recipes or other sections as needed */}
      {user.recipes && user.recipes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Resipi Terbaru {user.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.recipes.map((recipe) => (
              <li key={recipe.id}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {recipe.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Thumbnail Section */}
                    {recipe.images?.[0] ? (
                      <div className="relative w-full h-32 mb-2 overflow-hidden rounded-md">
                        <Image
                          src={recipe.images[0].url}
                          alt={recipe.images[0].alt || recipe.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 w-full h-32 flex items-center justify-center text-gray-500 text-sm mb-2 rounded-md">
                        No Image
                      </div>
                    )}
                    <Link
                      href={`/resepi/${recipe.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Lihat Resipi
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}