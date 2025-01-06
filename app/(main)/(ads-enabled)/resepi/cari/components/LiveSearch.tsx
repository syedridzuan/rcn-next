"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeResult {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  membersOnly: boolean;
  // If you want to display difficulty or publishedAt, add them:
  // difficulty?: string;
  // publishedAt?: string | null;
}

export default function LiveSearch() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  async function doSearch(searchTerm: string) {
    if (!searchTerm) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      // Ensure your server route enforces status = PUBLISHED in its query
      const res = await fetch(
        `/api/advancesearch?q=${encodeURIComponent(searchTerm)}`
      );
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // Debounce logic
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      doSearch(keyword);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword]);

  return (
    <div className="p-4 space-y-3 max-w-md border rounded">
      <h2 className="text-xl font-semibold">Carian Live</h2>

      <Input
        type="text"
        value={keyword}
        placeholder="Type to search..."
        onChange={(e) => setKeyword(e.target.value)}
      />

      {isLoading && <p className="text-sm text-gray-500">Memuatkan...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-2 space-y-1">
          {results.map((recipe) => (
            <li key={recipe.id}>
              <a
                href={`/resepi/${recipe.slug}`}
                className="text-blue-600 underline"
              >
                {recipe.title}
                {recipe.membersOnly && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Ahli Sahaja
                  </Badge>
                )}
              </a>
              <p className="text-xs text-gray-600">
                {recipe.shortDescription || "(Tiada ringkasan)"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        onClick={() => {
          setKeyword("");
          setResults([]);
        }}
      >
        Clear
      </Button>
    </div>
  );
}
