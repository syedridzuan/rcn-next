'use client'

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import Image from "next/image"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>

interface CategoryFormProps {
  onSubmit: (formData: FormData, image?: File) => Promise<void>
  isSubmitting: boolean
  initialData?: {
    name: string
    description?: string | null
    image?: string | null
  }
}

export default function CategoryForm({ 
  onSubmit, 
  isSubmitting, 
  initialData 
}: CategoryFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.image || null
  )

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (values: FormData) => {
    await onSubmit(values, selectedImage || undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Category" : "Create New Category"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewUrl && (
                    <div className="relative w-32 h-32">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 