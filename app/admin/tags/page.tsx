import { prisma } from "@/lib/prisma"
import TagListClient from "./tag-list"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function Page() {
  const session = await auth()
  if (!session?.user?.id) {
    // If not authenticated, redirect to login or another page
    redirect("/login")
  }

  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (

    <div className="container mx-auto p-8">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tag list</h1>
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <TagListClient tags={tags} />
      </CardContent>
    </Card>
    </div>
    </div>
  )
}
