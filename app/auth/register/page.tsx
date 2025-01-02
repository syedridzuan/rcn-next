import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Cipta Akaun",
  description: "Cipta akaun baru untuk memulakan.",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      {/* Widen the card to max-w-2xl (640px) or 3xl (768px) if you prefer */}
      <Card className="w-full max-w-3xl space-y-2 p-6 sm:p-8 mb-8 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold">Cipta Akaun</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Masukkan butiran anda di bawah untuk mencipta akaun anda.
          </CardDescription>
        </CardHeader>

        {/* We only have one Card here; the form itself does not use another card */}
        <CardContent className="space-y-4">
          <RegisterForm />
        </CardContent>

        <CardFooter className="flex flex-col items-center">
          <p className="w-full text-center text-sm text-muted-foreground">
            Sudah mempunyai akaun?{" "}
            <Link
              href="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              Log masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
