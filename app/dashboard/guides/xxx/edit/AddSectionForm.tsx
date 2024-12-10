"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { addSectionAction } from "./actions";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const FormSchema = z.object({
  title: z.string().nonempty("Title is required"),
  content: z.string().nonempty("Content is required"),
});
type SectionForm = z.infer<typeof FormSchema>;

export function AddSectionForm({ guideId }: { guideId: string }) {
  const router = useRouter();

  const form = useForm<SectionForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "", content: "" },
  });

  async function onSubmit(values: SectionForm) {
    const formData = new FormData();
    formData.append("guideId", guideId);
    formData.append("title", values.title);
    formData.append("content", values.content);

    try {
      await addSectionAction(formData);
      form.reset();
      // Refresh the page to show the newly added section
      router.refresh();
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input placeholder="Section title" {...field} />
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
              <FormLabel>Section Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Section details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add Section
        </Button>
      </form>
    </Form>
  );
}
