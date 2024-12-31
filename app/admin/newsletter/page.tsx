import { Suspense } from "react";
import { Metadata } from "next";
import { Newsletteradmin } from "./newsletter-admin";
import { adminShell } from "@/components/shell";
import { adminHeader } from "@/components/admin-header";
import { LoadingPage } from "@/components/loading";

export const metadata: Metadata = {
  title: "Newsletter Management",
  description: "Manage newsletter subscribers",
};

export default function NewsletterPage() {
  return (
    <adminShell>
      <adminHeader
        heading="Newsletter Management"
        text="Manage your newsletter subscribers"
      />
      <Suspense fallback={<LoadingPage />}>
        <Newsletteradmin />
      </Suspense>
    </adminShell>
  );
}
