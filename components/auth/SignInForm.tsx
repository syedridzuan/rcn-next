"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        throw new Error("Sign in failed");
      }

      if (result.error) {
        if (result.error === "email_not_verified") {
          setError("Please verify your email before logging in.");
        } else {
          // Map other error codes to user-friendly messages
          const errorMessages: Record<string, string> = {
            "invalid_password": "Invalid password.",
            "user_not_found": "No account found with that email.",
            "no_password_set": "This account does not have a password set.",
            "missing_credentials": "Please enter both email and password.",
          };
          setError(errorMessages[result.error] || "An error occurred during sign in.");
        }
      } else if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="Enter your email" 
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          placeholder="Enter your password" 
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md" role="alert">
          {error}
        </div>
      )}
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}