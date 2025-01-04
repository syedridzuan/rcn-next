"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SortOptions({ currentSort }: { currentSort: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-4">
      <Link
        href={{ pathname, query: { sort: "views" } }}
        className={`px-4 py-2 rounded-full ${
          currentSort === "views"
            ? "bg-primary text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        Sort by Views
      </Link>
      <Link
        href={{ pathname, query: { sort: "likes" } }}
        className={`px-4 py-2 rounded-full ${
          currentSort === "likes"
            ? "bg-primary text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        Sort by Likes
      </Link>
    </div>
  );
} 