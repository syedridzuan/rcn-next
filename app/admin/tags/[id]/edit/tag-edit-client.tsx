"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTagAction } from "../../actions";

interface TagEditClientProps {
  tag: {
    id: string;
    name: string;
  };
}

export default function TagEditClient({ tag }: TagEditClientProps) {
  const router = useRouter();
  const [name, setName] = useState(tag.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateTagAction(tag.id, {
        name: name.trim(),
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update tag");
        return;
      }

      toast.success("Tag updated successfully");
      router.push("/admin/tags");
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Tag"}
      </Button>
    </form>
  );
}
