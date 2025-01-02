"use client";

import { Recipe } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { RecipeWithAI } from "@/types/RecipeWithAI"; // <-- import

import { useState } from "react";

interface RecipeAuditCardProps {
  recipe: RecipeWithAI;
}
export default function RecipeAuditCard({ recipe }: RecipeAuditCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);

  // ... Accept / Reject logic remains the same ...

  if (hasUpdated) {
    return (
      <div className="p-4 border rounded-md bg-green-50">
        <p>✔ AI suggestion updated for recipe: {recipe.title}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow">
      <h2 className="font-semibold text-lg mb-2">{recipe.title}</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* LEFT: Existing */}
        <div>
          <h3 className="font-medium text-gray-700">Current</h3>
          <ul className="text-sm text-gray-600 space-y-1 mt-1">
            <li>PrepTime: {recipe.prepTime} min</li>
            <li>CookTime: {recipe.cookTime} min</li>
            <li>TotalTime: {recipe.totalTime ?? "N/A"} min</li>
            <li>Difficulty: {recipe.difficulty}</li>
            <li>ServingType: {recipe.servingType ?? "N/A"}</li>
            <li>
              Tags:{" "}
              {Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "(none)"}
            </li>
          </ul>
        </div>
        {/* RIGHT: AI */}
        <div>
          <h3 className="font-medium text-gray-700">AI Suggestion</h3>
          <ul className="text-sm text-gray-600 space-y-1 mt-1">
            <li>AI PrepTime: {recipe.openaiPrepTime ?? "(null)"} min</li>
            <li>AI CookTime: {recipe.openaiCookTime ?? "(null)"} min</li>
            <li>AI TotalTime: {recipe.openaiTotalTime ?? "(null)"} min</li>
            <li>AI Difficulty: {recipe.openaiDifficulty ?? "(null)"}</li>
            <li>AI ServingType: {recipe.openaiServingType ?? "(null)"}</li>
            <li>
              AI Tags:{" "}
              {recipe.openaiTags
                ? Array.isArray(recipe.openaiTags)
                  ? recipe.openaiTags.join(", ")
                  : JSON.stringify(recipe.openaiTags)
                : "(null)"}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {/* Accept Button */}
        <Button
          variant="default"
          onClick={() => handleAccept()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Accept AI"}
        </Button>
        {/* Reject Button */}
        <Button
          variant="destructive"
          onClick={() => handleReject()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Reject AI"}
        </Button>
      </div>
    </div>
  );

  async function handleAccept() {
    setIsProcessing(true);
    try {
      const resp = await fetch(
        `/admin/api/recipes/ai-audit/${recipe.id}/accept`,
        {
          method: "POST",
        }
      );
      if (!resp.ok) throw new Error("Failed to accept");
      setHasUpdated(true);
    } catch (error) {
      console.error(error);
      alert("Error accepting AI suggestions");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    setIsProcessing(true);
    try {
      const resp = await fetch(
        `/admin/api/recipes/ai-audit/${recipe.id}/reject`,
        {
          method: "POST",
        }
      );
      if (!resp.ok) throw new Error("Failed to reject");
      setHasUpdated(true);
    } catch (error) {
      console.error(error);
      alert("Error rejecting AI suggestions");
    } finally {
      setIsProcessing(false);
    }
  }
}
