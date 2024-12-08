"use client";

import { useState, useEffect } from "react";

interface Recipe {
  id: string;
  title: string;
}

export default function UploadImagePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch recipes when the component mounts
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("/api/recipes");
        if (response.ok) {
          const data: Recipe[] = await response.json();
          setRecipes(data);
        } else {
          console.error("Failed to fetch recipes");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    }

    fetchRecipes();
  }, []);

  const handleRecipeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipeId(event.target.value);
    setMessage(""); // Clear any previous messages
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
    setMessage(""); // Clear previous messages
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRecipeId) {
      setMessage("Please select a recipe.");
      return;
    }
    if (!files || files.length === 0) {
      setMessage("Please select one or more files to upload.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const response = await fetch(`/api/recipes/${selectedRecipeId}/images`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Images uploaded successfully!");
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to upload images."}`);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Upload Imagessss for a Recipe</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipe-select" className="block font-medium mb-2">
            Select a Recipe
          </label>
          <select
            id="recipe-select"
            onChange={handleRecipeChange}
            value={selectedRecipeId || ""}
            className="block w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select a recipe
            </option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="images" className="block font-medium mb-2">
            Select Images to Upload
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
