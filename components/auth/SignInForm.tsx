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
          setError("Sila sahkan emel anda sebelum log masuk.");
        } else if (result.error === "account_suspended") {
          setError("Akaun anda telah digantung. Sila hubungi sokongan.");
        } else {
          // Pemetaan mesej ralat kepada bahasa pengguna
          const errorMessages: Record<string, string> = {
            invalid_password: "Kata laluan tidak sah.",
            user_not_found: "Tiada akaun ditemui dengan emel tersebut.",
            no_password_set:
              "Akaun ini tidak mempunyai kata laluan yang ditetapkan.",
            missing_credentials:
              "Sila masukkan kedua-dua emel dan kata laluan.",
          };
          setError(
            errorMessages[result.error] || "Berlaku ralat semasa log masuk."
          );
        }
      } else if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Berlaku ralat yang tidak dijangka");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Emel</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Masukkan emel anda"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Kata Laluan</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Masukkan kata laluan anda"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div
          className="p-3 text-sm text-red-500 bg-red-50 rounded-md"
          role="alert"
        >
          {error}
        </div>
      )}
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Sedang log masuk..." : "Log Masuk"}
      </Button>
    </form>
  );
}
