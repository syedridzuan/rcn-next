import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UpdateProfileForm } from "./UpdateProfileForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shell } from "@/components/shell"

export default async function ProfilePage() {
  // Get the current session using auth()
  const session = await auth()
  
  // Redirect if not authenticated
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      instagramHandle: true,
      facebookHandle: true,
      tiktokHandle: true,
      youtubeHandle: true,
      blogUrl: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return (
    <Shell>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information and preferences. Your profile helps us personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>
    </Shell>
  )
}

