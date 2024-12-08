// app/auth/signin/page.tsx
// Remove the auth config from this file since we're now using the root auth.ts
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}
