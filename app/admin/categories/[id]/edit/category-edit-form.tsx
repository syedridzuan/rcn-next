"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { updateCategory } from "./actions";

const FormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
});

type FormType = z.infer<typeof FormSchema>;

interface CategoryEditFormProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
}

export default function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
  });

  const onSubmit = async (values: FormType) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", category.id);
      formData.append("name", values.name);
      if (values.description) {
        formData.append("description", values.description);
      }

      const fileInput = document.querySelector<HTMLInputElement>("#imageFile");
      if (fileInput?.files?.[0]) {
        formData.append("imageFile", fileInput.files[0]);
      }

      await updateCategory(formData);
      toast.success("Category updated successfully!");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
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
              {category.image && (
                <div className="mb-2">
                  <img
                    src={category.image}
                    alt="Current image"
                    className="w-32 h-32 object-cover"
                  />
                  <p className="text-sm text-gray-600">Current Image</p>
                </div>
              )}
              <Input type="file" id="imageFile" name="imageFile" />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
