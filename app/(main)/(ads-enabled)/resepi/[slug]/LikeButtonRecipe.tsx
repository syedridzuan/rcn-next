"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  recipeId: string;
}

export function LikeButtonRecipe({ recipeId }: LikeButtonProps) {
  const { data: session } = useSession(); // NextAuth session
  const [likeCount, setLikeCount] = useState(0);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Fetch current “like” info on mount
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/likes/${recipeId}`);
        if (!res.ok) throw new Error("Failed to fetch like info.");
        const data = await res.json();
        setLikeCount(data.likeCount || 0);
        setAlreadyLiked(data.alreadyLiked || false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLikes();
  }, [recipeId]);

  // 2. Handle “like” action
  const handleLike = async () => {
    // If not logged in => no action (UI might already be disabled)
    if (!session?.user?.id) {
      alert("Sila log masuk untuk menekan Suka.");
      return;
    }
    // If already liked => do nothing
    if (alreadyLiked) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/likes/${recipeId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to like the recipe.");

      const data = await res.json();
      setLikeCount(data.likeCount || 0);
      setAlreadyLiked(data.alreadyLiked || true);
    } catch (error) {
      console.error("Error liking recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={!isLoggedIn || alreadyLiked || loading}
    >
      <Heart className="h-4 w-4 mr-2" />
      {loading ? "..." : `Suka (${likeCount})`}
    </Button>
  );
}
