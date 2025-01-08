import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UpdateProfileForm } from "./UpdateProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shell } from "@/components/shell";

export default async function ProfilePage() {
  // 1) Check session (server side)
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // 2) Fetch user from DB, but skip or omit the role in the final object
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      // role: true, // (we can fetch or skip; not displayed anyway)
      createdAt: true,
      updatedAt: true,
      instagramHandle: true,
      facebookHandle: true,
      tiktokHandle: true,
      youtubeHandle: true,
      blogUrl: true,
      username: true,
      sex: true, // "MALE", "FEMALE", or null
      birthdate: true,
    },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemui"); // "User not found."
  }

  return (
    <Shell>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tetapan Profil</CardTitle>
          <CardDescription>
            Urus maklumat dan tetapan profil anda. Profil anda membantu kami
            memperibadikan pengalaman anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We pass user to the form, but we don’t show user.role anywhere */}
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>
    </Shell>
  );
}
