import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TagCreateClient from "./tag-create-client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function NewTagPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Tag</h1>
        <Card>
          <CardHeader>
            <CardTitle>Create a Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <TagCreateClient userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
