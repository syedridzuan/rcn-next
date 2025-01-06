// File: app/admin/recipes/generate/FormGenerateRecipe.tsx
"use client";

import { useState } from "react";
import { generateRecipeDraftAction } from "./actions";
import { RECIPE_PROMPT } from "@/lib/prompts/recipePrompt"; //  <-- import from your new file

export default function FormGenerateRecipe() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const script = formData.get("script") as string;
    const customPrompt = formData.get("prompt") as string;

    try {
      // call the server action from actions.ts
      const result = await generateRecipeDraftAction(script, customPrompt);
      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.draftId) {
        setDraftId(result.draftId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt */}
      <div>
        <label className="block font-medium mb-1" htmlFor="prompt">
          Prompt (system instructions):
        </label>
        <textarea
          id="prompt"
          name="prompt"
          className="w-full border p-2 rounded"
          rows={6}
          // Use the imported RECIPE_PROMPT
          defaultValue={RECIPE_PROMPT}
        />
      </div>

      {/* Script */}
      <div>
        <label className="block font-medium mb-1" htmlFor="script">
          YouTube Voiceover Script:
        </label>
        <textarea
          id="script"
          name="script"
          className="w-full border p-2 rounded"
          rows={10}
          placeholder="Masukkan teks transkrip di sini..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "Generate Draft"}
      </button>

      {errorMessage && (
        <div className="text-red-600">
          <p>Error: {errorMessage}</p>
        </div>
      )}
      {draftId && (
        <div className="text-green-700 mt-4">
          <p>Draft created successfully! ID: {draftId}</p>
          <p>
            <a
              href={`/admin/recipes/drafts/${draftId}`}
              className="underline text-blue-700"
            >
              View/Edit Draft
            </a>
          </p>
        </div>
      )}
    </form>
  );
}
