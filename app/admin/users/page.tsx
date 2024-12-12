import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { UserActions } from "./user-actions"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: [
      { role: 'asc' },
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          recipes: true,
          comments: true,
        }
      }
    }
  })

  return users
}

function UserStatusBadge({ status = "ACTIVE" }: { status?: string }) {
  const variants: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    SUSPENDED: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  }

  return (
    <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status.toLowerCase()}
    </Badge>
  )
}

export default async function UsersPage() {
  // Check if user is authenticated and is an admin
  const session = await auth()
  if (!session?.user?.role === "ADMIN") {
    redirect("/")
  }

  const users = await getUsers()

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <span className="text-muted-foreground">
          {users.length} users total
        </span>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-medium">User</th>
                <th className="py-3 px-4 text-left font-medium">Role</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">Activity</th>
                <th className="py-3 px-4 text-left font-medium">Joined</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-muted-foreground">
                      {user._count.recipes} recipes
                      <br />
                      {user._count.comments} comments
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <UserActions 
                      userId={user.id}
                      currentRole={user.role}
                      currentStatus={user.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 