"use client";

import { useState, useEffect } from "react";

interface RecipeImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export default function ManageRecipeImages({
  params,
}: {
  params: { recipeId: string };
}) {
  const { recipeId } = params;
  const [images, setImages] = useState<RecipeImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`/api/recipes/${recipeId}/images`);
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }

    fetchImages();
  }, [recipeId]);

  const handleSetPrimary = async (imageId: string) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/recipes/${recipeId}/images/primary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      if (response.ok) {
        setMessage("Primary image updated successfully!");
        setImages((prevImages) =>
          prevImages.map((image) =>
            image.id === imageId
              ? { ...image, isPrimary: true }
              : { ...image, isPrimary: false }
          )
        );
      } else {
        setMessage("Failed to update primary image.");
      }
    } catch (error) {
      console.error("Error updating primary image:", error);
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Recipe Images</h1>

      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative border p-2 rounded">
            <img
              src={image.url}
              alt="Recipe Image"
              className="w-full h-auto rounded"
            />
            {image.isPrimary && (
              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
            <button
              onClick={() => handleSetPrimary(image.id)}
              disabled={loading || image.isPrimary}
              className={`mt-2 w-full text-sm px-4 py-2 ${
                image.isPrimary
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white"
              } rounded`}
            >
              {image.isPrimary ? "Primary Image" : "Set as Primary"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
