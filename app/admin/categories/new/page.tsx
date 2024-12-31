"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createCategory } from "../actions";
import CategoryForm from "../category-form";

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    data: { name: string; description?: string },
    image?: File
  ) => {
    setIsSubmitting(true);

    try {
      const result = await createCategory({
        ...data,
        image,
      });

      if (result.success) {
        toast.success("Category created successfully");
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create category");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
