import { DataTable } from "./data-table";
import { columns } from "./columns";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const data = guides.map((guide) => ({
    ...guide,
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Guides</h1>
        <Link href="/admin/guides/new">
          <Button>Create Guide</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
