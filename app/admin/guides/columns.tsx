"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type Guide = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

// Create a consistent date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const columns: ColumnDef<Guide>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const guide = row.original;

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = `/admin/guides/${guide.id}/edit`;
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this guide?")) {
                // Handle delete
              }
            }}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
