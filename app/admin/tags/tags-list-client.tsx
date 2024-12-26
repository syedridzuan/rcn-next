"use client"

import { useRouter } from "next/navigation"
import { deleteTagAction } from "./actions"
import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

type Tag = {
  id: string
  name: string
}

export default function TagListClient({ tags }: { tags: Tag[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteTagAction(id)
    if (!result.success) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
      setDeletingId(null)
      return
    }
    toast({ title: "Tag deleted successfully." })
    startTransition(() => {
      router.refresh() // Refresh the page to update the list
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Button onClick={() => router.push("/dashboard/tags/new")}>
          New Tag
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="link" onClick={() => router.push(`/dashboard/tags/${tag.id}/edit`)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(tag.id)}
                  disabled={deletingId === tag.id || isPending}
                >
                  {deletingId === tag.id || isPending ? "Deleting..." : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
