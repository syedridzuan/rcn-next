import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import CategoryEditForm from "./category-edit-form"

interface Props {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryEditForm category={category} />
    </div>
  )
}
