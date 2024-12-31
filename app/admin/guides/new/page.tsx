import { adminShell } from "@/components/shell";
import { adminHeader } from "@/components/admin-header";
import { NewGuideForm } from "./new-guide-form";

export const metadata = {
  title: "New Guide",
  description: "Create a new guide",
};

export default function NewGuidePage() {
  return (
    <adminShell>
      <adminHeader
        heading="Create New Guide"
        text="Add a new guide to your collection"
      />
      <div className="grid gap-8">
        <NewGuideForm />
      </div>
    </adminShell>
  );
}
