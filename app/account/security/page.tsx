import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Shell } from "@/components/shell"
import { ChangePasswordForm } from "./ChangePasswordForm"
import { Shield } from "lucide-react"

export default async function SecurityPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  return (
    <Shell>
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Security Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account security and password
            </p>
          </div>
          <Shield className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Choose a strong password that you haven&apos;t used before
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </Shell>
  )
} 