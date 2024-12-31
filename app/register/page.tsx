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
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-2 p-4 sm:p-6 mb-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Cipta akaun</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Masukkan butiran anda di bawah untuk mencipta akaun anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm />
        </CardContent>

        <CardFooter>
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
