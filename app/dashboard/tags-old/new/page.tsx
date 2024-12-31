"use client";

import { createTagAction } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function NewTagPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = await createTagAction(formData);

    if (result.success) {
      toast.success(result.message);
      router.push("/admin/tags");
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 space-y-4">
      <h2 className="text-xl font-bold">Create New Tag</h2>
      <input
        type="text"
        name="name"
        placeholder="Tag name"
        className="border w-full px-3 py-2"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => history.back()}
          className="border px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
