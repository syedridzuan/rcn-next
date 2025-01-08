"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
// If using shadcn/ui toasts, import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "./actions";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        const result = await registerAction(data);
        if (!result.success) {
          // Handle any field errors
          if (result.fieldErrors) {
            for (const [field, error] of Object.entries(result.fieldErrors)) {
              form.setError(field as keyof RegisterInput, { message: error });
            }
            return;
          }
          toast.error(result.message || "Pendaftaran gagal");
          return;
        }
        // Success
        toast.success(
          "Akaun berjaya dicipta. Sila semak emel anda untuk pengesahan."
        );
        router.push("/auth/verify-email-prompt");
      } catch (error) {
        toast.error("Terdapat ralat. Sila cuba lagi.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Nama Penuh */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Nama Penuh</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama penuh anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nama Pengguna */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Nama Pengguna</FormLabel>
              <FormControl>
                <Input placeholder="Pilih nama pengguna yang unik" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Emel */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Emel</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Masukkan emel anda"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kata Laluan */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Kata Laluan</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Cipta kata laluan"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kotak semak (Checkbox) Terma */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Terima terma dan syarat"
                />
              </FormControl>
              <div className="space-y-1 leading-tight">
                <FormLabel className="text-sm font-medium">
                  {/* Link to the T&C page instead of opening a dialog */}
                  Saya bersetuju dengan{" "}
                  <a
                    href="/terma-penggunaan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    terma dan syarat
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
          disabled={!form.getValues("terms") || isPending}
        >
          {isPending ? "Sedang mencipta akaun..." : "Cipta akaun"}
        </Button>
      </form>
    </Form>
  );
}
