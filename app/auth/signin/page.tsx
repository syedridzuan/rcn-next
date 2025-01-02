"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get("error");
  const error = rawError ? decodeURIComponent(rawError) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Log Masuk</CardTitle>
          <CardDescription>Selamat datang kembali!</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Your existing sign-in form */}
          <SignInForm />
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Link
            href="/auth/forgot-password/"
            className="text-sm underline hover:text-primary"
          >
            Lupa kata laluan?
          </Link>

          <Link
            href="/auth/register"
            className="text-sm underline hover:text-primary"
          >
            Daftar akaun baharu
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
