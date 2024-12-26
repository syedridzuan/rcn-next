"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "./actions";

interface AddImageFormProps {
  guideId: string;
}

// Create a submit button component that uses useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload Image"}
    </Button>
  );
}

export function AddImageForm({ guideId }: AddImageFormProps) {
  return (
    <form action={uploadImageAction} className="space-y-4">
      <input type="hidden" name="guideId" value={guideId} />
      <div>
        <label className="block mb-2 font-semibold">Upload Image</label>
        <input type="file" name="imageFile" accept="image/*" required />
      </div>
      <div>
        <label className="block mb-2 font-semibold">Alt Text (optional)</label>
        <input type="text" name="alt" className="border p-2 rounded w-full" />
      </div>
      <SubmitButton />
    </form>
  );
}
