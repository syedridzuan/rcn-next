"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dropdown } from "@/components/Dropdown";

interface Category {
  id: string;
  label: string;
  href: string;
  count: number;
}

export function CategoryDropdown({ className = "" }: { className?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Call the API route we just created
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Failed to fetch categories from server.");
        }
        const data: Category[] = await res.json();
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <Dropdown title="Kategori" className={className}>
      {/* Add a wrapper div with scroll and max height */}
      <div className="max-h-96 overflow-y-auto border-t border-gray-200">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            {cat.label} ({cat.count})
          </Link>
        ))}
      </div>
    </Dropdown>
  );
}
