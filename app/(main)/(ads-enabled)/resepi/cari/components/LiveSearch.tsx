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
}

export default function LiveSearch() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Use a ref for the debounce timer instead of state
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 2) Debounced search function
  async function doSearch(searchTerm: string) {
    if (!searchTerm) {
      // If empty, reset results
      setResults([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      // Call your /api/advancesearch or any relevant endpoint
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

  // 3) Whenever `keyword` changes, set a new timer
  useEffect(() => {
    // Clear any existing timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set a new timer
    debounceRef.current = setTimeout(() => {
      doSearch(keyword);
    }, 400);

    // Cleanup on unmount or re-run
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword]);

  return (
    <div className="p-4 space-y-3 max-w-md border rounded">
      <h2 className="text-xl font-semibold">Carian Live</h2>

      {/* Search Input */}
      <Input
        type="text"
        value={keyword}
        placeholder="Type to search..."
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Loading / Error states */}
      {isLoading && <p className="text-sm text-gray-500">Memuatkan...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Results List */}
      {results.length > 0 && (
        <ul className="mt-2 space-y-1">
          {results.map((recipe) => {
            console.log('Recipe:', recipe);
            return (
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
            );
          })}
        </ul>
      )}

      {/* Optional: Clear Button */}
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
