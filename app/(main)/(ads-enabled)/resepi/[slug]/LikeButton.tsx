"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  recipeId: string;
  className?: string;
}

/**
 * A "Like" button that:
 * 1. Fetches the existing like count from /api/likes?recipeId=xxx
 * 2. Updates the count when user clicks "Suka"
 * 3. Displays a loading indicator (e.g. "...") in place of text while waiting.
 * 4. Uses shadcn's <Button> (variant="outline", size="sm") for consistent styling.
 */
export function LikeButton({ recipeId, className }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Fetch total likes on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/likes?recipeId=${recipeId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch like count");
        }
        const data = await res.json();
        setLikeCount(data.likes || 0);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    })();
  }, [recipeId]);

  // 2. Handle "Suka" click
  const handleLike = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!resp.ok) {
        throw new Error("Failed to update like count");
      }
      const data = await resp.json();
      setLikeCount(data.likes || 0);
    } catch (error) {
      console.error("Error updating likes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={className}
    >
      <Heart className="h-4 w-4 mr-2" />
      {loading ? "..." : `Suka (${likeCount})`}
    </Button>
  );
}
