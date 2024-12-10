"use client";

import { addCategory } from "./actions"; // Server action
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // shadcn/ui toast hook

const FormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
});

type FormType = z.infer<typeof FormSchema>;

export default function AddCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormType) => {
    setGlobalError(null);
    // Construct FormData
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) {
      formData.append("description", values.description);
    }

    const fileInput = document.querySelector<HTMLInputElement>("#imageFile");
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      formData.append("imageFile", fileInput.files[0]);
    }

    try {
      await addCategory(formData);
      toast({
        description: "Category added successfully!",
        variant: "default",
      });
      // Delay navigation slightly to let the toast show clearly,
      // or navigate immediately if preferred.
      setTimeout(() => {
        router.push("/dashboard/categories");
      }, 1000);
    } catch (error: any) {
      setGlobalError(error.message || "An error occurred.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          {globalError && (
            <div className="mb-4 text-red-600 font-semibold">{globalError}</div>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              encType="multipart/form-data"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Breakfast" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label
                  htmlFor="imageFile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Image File (optional)
                </label>
                <Input type="file" id="imageFile" name="imageFile" />
              </div>

              <Button type="submit" className="w-full">
                Add Category
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
