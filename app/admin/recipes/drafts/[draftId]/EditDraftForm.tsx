"use client";

import { DraftRecipe, RecipeDifficulty, ServingType } from "@prisma/client";
import { useState } from "react";
import {
  updateDraftRecipeAction, // Make sure this is exported in actions-drafts.ts
  publishDraftRecipeAction,
} from "./actions-drafts"; // Adjust path as needed
import { useToast } from "@/components/ui/use-toast";

// Extend DraftRecipe with optional strings for openaiCost & date strings
interface DraftRecipeWithStrings extends DraftRecipe {
  openaiCost?: string | null;
  createdAtString?: string;
  updatedAtString?: string;
  // If your DraftRecipe also has a slug column, you can store it here:
  slug?: string | null;
}

export default function EditDraftForm({
  draft,
}: {
  draft: DraftRecipeWithStrings;
}) {
  // Basic fields
  const [title, setTitle] = useState(draft.title ?? "");
  const [description, setDescription] = useState(draft.description ?? "");
  const [shortDescription, setShortDescription] = useState(
    draft.shortDescription ?? ""
  );

  // Slug (new field)
  // If your DraftRecipe model has a `slug` field, use that as default. Otherwise, keep empty.
  const [slug, setSlug] = useState(draft.slug ?? "");

  // Numeric/time fields
  const [prepTime, setPrepTime] = useState(draft.prepTime ?? 0);
  const [cookTime, setCookTime] = useState(draft.cookTime ?? 0);
  const [totalTime, setTotalTime] = useState(draft.totalTime ?? 0);

  // Difficulty
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(
    draft.difficulty ?? "MEDIUM"
  );

  // Servings
  const [servings, setServings] = useState(draft.servings ?? 0);
  const [servingType, setServingType] = useState<ServingType | null>(
    draft.servingType ?? null
  );

  // Tag strings
  const [tags, setTags] = useState<string[]>(draft.tags ?? []);

  // JSON fields for tips/sections
  const [tipsJson, setTipsJson] = useState(
    draft.tips ? JSON.stringify(draft.tips, null, 2) : ""
  );
  const [sectionsJson, setSectionsJson] = useState(
    draft.sections ? JSON.stringify(draft.sections, null, 2) : ""
  );

  // State for messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Toast from shadcn/ui
  const { toast } = useToast();

  // For read-only cost display
  const openaiCostDisplay = draft.openaiCost || "0";

  // --------------------------------
  //  Handle updating the draft
  // --------------------------------
  async function handleUpdateDraft() {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Parse JSON for tips/sections
    let parsedTips: any = null;
    let parsedSections: any = null;
    try {
      parsedTips = tipsJson ? JSON.parse(tipsJson) : null;
      parsedSections = sectionsJson ? JSON.parse(sectionsJson) : null;
    } catch (parseErr) {
      const msg = "Error parsing tips or sections JSON. Please fix and retry.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Update error",
        description: msg,
      });
      return;
    }

    // Attempt server action
    try {
      const res = await updateDraftRecipeAction(draft.id, {
        title,
        description,
        shortDescription,
        prepTime,
        cookTime,
        totalTime,
        difficulty,
        servings,
        servingType,
        tags,
        tips: parsedTips,
        sections: parsedSections,
        // If your DraftRecipe has a slug column, you could store it as well:
        //slug,
      });
      if (res.error) {
        setErrorMessage("Failed to update: " + res.error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: res.error,
        });
      } else {
        setSuccessMessage("Draft updated successfully!");
        toast({
          title: "Draft updated",
          description: "Your draft changes have been saved.",
        });
      }
    } catch (err: any) {
      const errMsg = err.message || "Unknown error";
      setErrorMessage(errMsg);
      toast({
        variant: "destructive",
        title: "Update error",
        description: errMsg,
      });
    }
  }

  // --------------------------------
  //  Handle publishing the draft
  // --------------------------------
  async function handlePublishDraft() {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Pass the user-defined slug to the server action
      const res = await publishDraftRecipeAction(draft.id, slug);
      if (res?.error) {
        const msg = "Failed to publish: " + res.error;
        setErrorMessage(msg);
        toast({
          variant: "destructive",
          title: "Publish failed",
          description: res.error,
        });
      } else {
        const msg = "Draft published successfully!";
        setSuccessMessage(msg);
        toast({ title: "Draft published", description: msg });
      }
    } catch (err: any) {
      const errMsg = err.message || "Unknown error";
      setErrorMessage(errMsg);
      toast({
        variant: "destructive",
        title: "Publish error",
        description: errMsg,
      });
    }
  }

  // --------------------------------
  //  A simple approach to handle tags
  // --------------------------------
  function handleTagChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTags = e.target.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTags(newTags);
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <label className="block font-semibold">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-1 block w-full mt-1"
        />
      </label>

      {/* Description */}
      <label className="block font-semibold">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border p-1 block w-full mt-1"
        />
      </label>

      {/* Short Description */}
      <label className="block font-semibold">
        Short Description
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="border p-1 block w-full mt-1"
        />
      </label>

      {/* Slug (new field) */}
      <label className="block font-semibold">
        Slug (optional override)
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border p-1 block w-full mt-1"
          placeholder="e.g. muruku-rangup"
        />
      </label>

      {/* Times */}
      <div className="flex gap-4">
        <div>
          <label className="block font-semibold">Prep Time (min)</label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(Number(e.target.value))}
            className="border p-1 w-24 mt-1"
          />
        </div>
        <div>
          <label className="block font-semibold">Cook Time (min)</label>
          <input
            type="number"
            value={cookTime}
            onChange={(e) => setCookTime(Number(e.target.value))}
            className="border p-1 w-24 mt-1"
          />
        </div>
        <div>
          <label className="block font-semibold">Total Time (min)</label>
          <input
            type="number"
            value={totalTime}
            onChange={(e) => setTotalTime(Number(e.target.value))}
            className="border p-1 w-24 mt-1"
          />
        </div>
      </div>

      {/* Difficulty */}
      <label className="block font-semibold">
        Difficulty
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
          className="border p-1 block w-48 mt-1"
        >
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
          <option value="EXPERT">EXPERT</option>
        </select>
      </label>

      {/* Servings */}
      <div className="flex gap-4">
        <div>
          <label className="block font-semibold">Servings</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="border p-1 w-24 mt-1"
          />
        </div>
        <div>
          <label className="block font-semibold">Serving Type</label>
          <select
            value={servingType || ""}
            onChange={(e) => {
              const val = e.target.value as ServingType;
              setServingType(val || null);
            }}
            className="border p-1 w-48 mt-1"
          >
            <option value="">(None)</option>
            <option value="PEOPLE">PEOPLE</option>
            <option value="SLICES">SLICES</option>
            <option value="PIECES">PIECES</option>
            <option value="PORTIONS">PORTIONS</option>
            <option value="BOWLS">BOWLS</option>
            <option value="GLASSES">GLASSES</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <label className="block font-semibold mt-4">
        Tags (comma-separated)
        <input
          type="text"
          value={tags.join(", ")}
          onChange={handleTagChange}
          className="border p-1 block w-full mt-1"
          placeholder="Muruku, Deepavali"
        />
      </label>

      {/* Tips JSON */}
      <label className="block font-semibold">
        Tips (JSON)
        <textarea
          value={tipsJson}
          onChange={(e) => setTipsJson(e.target.value)}
          rows={4}
          className="border p-1 block w-full mt-1 font-mono text-sm"
        />
      </label>

      {/* Sections JSON */}
      <label className="block font-semibold">
        Sections (JSON)
        <textarea
          value={sectionsJson}
          onChange={(e) => setSectionsJson(e.target.value)}
          rows={6}
          className="border p-1 block w-full mt-1 font-mono text-sm"
        />
      </label>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleUpdateDraft}
        >
          Update Draft
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={handlePublishDraft}
        >
          Publish
        </button>
      </div>

      {/* Error / success messages */}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      {/* Info / read-only fields */}
      <div className="mt-4 p-2 border border-gray-300 rounded space-y-2">
        <p>Draft ID: {draft.id}</p>
        <p>Created At: {draft.createdAtString}</p>
        <p>Updated At: {draft.updatedAtString}</p>
        <p>OpenAI Cost: {openaiCostDisplay}</p>
      </div>
    </div>
  );
}
