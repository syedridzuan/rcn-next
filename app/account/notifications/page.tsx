import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import NotificationForm from "./notification-form";

// 1) The server component for the Notification Settings page.
export default async function NotificationSettingsPage() {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch current user’s preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscribeNewsletter: true,
      subscribeCommentReply: true,
      subscribeRecipeComment: true,
    },
  });

  // If no user found for this ID, handle it (redirect or show 404)
  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive updates and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            2) Render the client component with the user’s existing preferences.
            We pass them as props so the client component can initialize states.
          */}
          <NotificationForm
            initialNewsletter={user.subscribeNewsletter}
            initialCommentReply={user.subscribeCommentReply}
            initialRecipeComment={user.subscribeRecipeComment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
