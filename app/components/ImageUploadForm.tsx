"use client";

import { useState } from "react";

interface ImageUploadFormProps {
  recipeId: string; // Pass the recipeId dynamically
}

export default function ImageUploadForm({ recipeId }: ImageUploadFormProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
    setMessage(""); // Clear previous messages
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!files || files.length === 0) {
      setMessage("Please select one or more files to upload.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(`/api/recipes/${recipeId}/images`, {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="images" className="block font-medium">
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
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
