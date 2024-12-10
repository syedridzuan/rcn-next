"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addGuideAction } from "./actions";

const FormSchema = z.object({
  title: z.string().nonempty("Title is required"),
  content: z.string().optional(),
});
type FormType = z.infer<typeof FormSchema>;

function GuidesList() {
  const [guides, setGuides] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/guides")
      .then((res) => res.json())
      .then(setGuides)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!guides || guides.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No guides found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {guides.map((guide) => (
            <li
              key={guide.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {guide.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Created at: {new Date(guide.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Edit Guide Button */}
                  <Link href={`/dashboard/guides/${guide.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit Guide
                    </Button>
                  </Link>

                  {/* Upload Image Button */}
                  <Link href={`/dashboard/guides/${guide.id}/images`}>
                    <Button variant="outline" size="sm">
                      Upload Image
                    </Button>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function DashboardGuidesPage() {
  const router = useRouter();
  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "", content: "" },
  });

  async function onSubmit(values: FormType) {
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.content) {
      formData.append("content", values.content);
    }

    try {
      const guideId = await addGuideAction(formData);
      form.reset();
      router.push(`/dashboard/guides/${guideId}/edit`);
    } catch (error: any) {
      console.error(error);
      // Handle error if needed
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guide Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Beginner's Bread Baking"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Guide main content..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Add Guide
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <GuidesList />
    </div>
  );
}
