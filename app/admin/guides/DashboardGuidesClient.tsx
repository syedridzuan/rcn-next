"use client";

import { useForm } from "react-hook-form";
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

export default function adminGuidesClient({ guides }: { guides: any[] }) {
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted with:", data);
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Guides</CardTitle>
        </CardHeader>
        <CardContent>
          {guides.length === 0 ? (
            <p className="text-gray-500">No guides found.</p>
          ) : (
            <ul className="space-y-4">
              {guides.map((guide) => (
                <li
                  key={guide.id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <a
                    href={`/guides/${guide.slug}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {guide.title}
                  </a>
                  <p className="text-sm text-gray-600">
                    Created at:{" "}
                    {new Date(guide.createdAt).toISOString().split("T")[0]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
