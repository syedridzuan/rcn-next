import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import TagEditClient from "./tag-edit-client"

interface Props {
  params: {
    id: string
  }
}

export default async function EditTagPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const tag = await prisma.tag.findUnique({
    where: { id: params.id }
  })

  if (!tag) {
    notFound()
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Tag</h1>
      <TagEditClient tag={tag} />
    </div>
  )
}
