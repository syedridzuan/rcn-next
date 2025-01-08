"use client";

import { useRouter } from "next/navigation";

interface CategoryFiltersProps {
  difficulty?: string;
  sort?: string;
  slug: string;
}

export default function CategoryFilters({
  difficulty,
  sort,
  slug,
}: CategoryFiltersProps) {
  const router = useRouter();

  return (
    <section className="mb-8 flex items-center gap-4 flex-wrap">
      {/* Difficulty Filter */}
      {/* <div className="flex items-center gap-2">
        <span>Kesukaran:</span>
        <select
          value={difficulty || ""}
          onChange={(e) => {
            const diffValue = e.target.value;
            const url = new URL(window.location.href);
            if (diffValue) {
              url.searchParams.set("difficulty", diffValue);
            } else {
              url.searchParams.delete("difficulty");
            }
            // reset to first page
            url.searchParams.delete("page");
            router.push(url.toString());
          }}
          className="border px-2 py-1 text-sm rounded"
        >
          <option value="">Semua</option>
          <option value="EASY">Mudah</option>
          <option value="MEDIUM">Sederhana</option>
          <option value="HARD">Sukar</option>
          <option value="EXPERT">Pakar</option>
        </select>
      </div> */}

      {/* Sort Filter */}
      <div className="flex items-center gap-2">
        <span>Susun:</span>
        <select
          value={sort || ""}
          onChange={(e) => {
            const sortValue = e.target.value;
            const url = new URL(window.location.href);
            if (sortValue) {
              url.searchParams.set("sort", sortValue);
            } else {
              url.searchParams.delete("sort");
            }
            // reset to first page
            url.searchParams.delete("page");
            router.push(url.toString());
          }}
          className="border px-2 py-1 text-sm rounded"
        >
          <option value="">Terbaru</option>
          <option value="cookTime">Masa Memasak</option>
          <option value="prepTime">Masa Penyediaan</option>
        </select>
      </div>

      {/* A 'share category' button */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("URL disalin ke papan klip!");
        }}
        className="border px-3 py-1 text-sm rounded hover:bg-orange-50"
      >
        Kongsi Kategori
      </button>
    </section>
  );
}
