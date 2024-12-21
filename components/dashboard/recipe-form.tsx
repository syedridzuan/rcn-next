"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2 } from "lucide-react"
import { createRecipe, updateRecipe } from "@/app/dashboard/recipes/actions"
import { toast } from "sonner"

//
// Zod schema
//
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  cookTime: z.coerce.number().min(1, "Cook time is required"),
  prepTime: z.coerce.number().min(1, "Prep time is required"),
  servings: z.coerce.number().min(1, "Servings is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  categoryId: z.string().min(1, "Category is required"),
  sections: z.array(
    z.object({
      title: z.string().min(1, "Section title is required"),
      type: z.string().min(1, "Section type is required"),
      items: z.array(
        z.object({
          content: z.string().min(1, "Item content is required"),
        })
      ),
    })
  ),
  tips: z.array(z.string().min(1, "Tip cannot be empty")).optional(),
  tags: z.array(z.string()).optional(),
  isEditorsPick: z.boolean().optional(),
})

type RecipeFormData = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  categories: { id: string; name: string }[]
  /**
   * A list of all available tag names from DB (if you want to show them).
   * But with the new single text field approach, you can omit it or keep for reference.
   */
  tags: string[]
  initialData?: RecipeFormData
  recipeId?: string
}

export function RecipeForm({
  categories,
  tags,
  initialData,
  recipeId,
}: RecipeFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  // React Hook Form setup
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      shortDescription: "",
      language: "en",
      cookTime: 10,
      prepTime: 10,
      servings: 2,
      difficulty: "EASY",
      categoryId: categories[0]?.id || "",
      sections: [],
      tips: [],
      tags: [],
      isEditorsPick: false,
    },
  })

  //
  // (1) Use a single text box to handle comma-separated tags
  // Initialize from `initialData?.tags` if editing
  //
  const [tagString, setTagString] = useState(
    initialData?.tags?.join(", ") || ""
  )

  // Field arrays for sections and tips
  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    name: "sections",
    control: form.control,
  })

  const {
    fields: tips,
    append: appendTip,
    remove: removeTip,
  } = useFieldArray({
    name: "tips",
    control: form.control,
  })

  // We don't need a field array for tags anymore,
  // since we're capturing them in tagString.

  //
  // When user submits the form
  //
  async function onSubmit(data: RecipeFormData) {
    try {
      setIsPending(true)

      // Parse the comma-separated tags from tagString
      const parsedTags = tagString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      // Overwrite the `tags` array with the parsed results
      data.tags = parsedTags

      if (recipeId) {
        const result = await updateRecipe(recipeId, data)
        if (result?.success) {
          toast.success("Recipe updated successfully")
        }
      } else {
        const result = await createRecipe(data)
        if (result?.success) {
          toast.success("Recipe created successfully")
        }
      }

      router.push("/dashboard/recipes")
    } catch (error) {
      toast.error(recipeId ? "Failed to update recipe" : "Failed to create recipe")
      setIsPending(false)
    }
  }

  //
  // Calculate totalTime on-the-fly (prepTime + cookTime)
  // We'll show it read-only in the form
  //
  const prepVal = form.watch("prepTime")
  const cookVal = form.watch("cookTime")
  const totalTime = (Number(prepVal) || 0) + (Number(cookVal) || 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Recipe title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description & Short Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the recipe"
                    {...field}
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="One-liner or short excerpt about this recipe"
                    {...field}
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Language & Difficulty */}
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ms">Malay</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PrepTime, CookTime, Servings */}
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display totalTime read-only */}
          <div className="space-y-1">
            <FormLabel>Total Time (minutes)</FormLabel>
            <Input
              type="number"
              value={totalTime}
              readOnly
              className="opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Editor's pick */}
          <FormField
            control={form.control}
            name="isEditorsPick"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Editor's Pick</FormLabel>
                  <p className="text-sm text-gray-500">
                    Feature this recipe as an editor's pick
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Single text box for comma-separated tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          <FormLabel>Enter tags, separated by commas</FormLabel>
          <Input
            placeholder="e.g. nasi lemak, spicy, coconut"
            value={tagString}
            onChange={(e) => setTagString(e.target.value)}
          />
        </div>

        {/* Recipe Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recipe Sections</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSection({
                  title: "",
                  type: "INGREDIENTS",
                  items: [{ content: "" }],
                })
              }
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>

          {sections.map((section, sectionIndex) => (
            <RecipeSection
              key={section.id}
              form={form}
              index={sectionIndex}
              onRemove={() => removeSection(sectionIndex)}
            />
          ))}
        </div>

        {/* Tips Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tips</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTip("")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Tip
            </Button>
          </div>

          {tips.map((tip, index) => (
            <div key={tip.id} className="flex gap-2 items-center">
              <FormField
                control={form.control}
                name={`tips.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., Let dough rest for 10 mins"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTip(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* Submit & Cancel */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? recipeId
                ? "Updating..."
                : "Creating..."
              : recipeId
              ? "Update Recipe"
              : "Create Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

//
// A helper subcomponent for the “sections” array.
//
function RecipeSection({
  form,
  index,
  onRemove,
}: {
  form: any
  index: number
  onRemove: () => void
}) {
  const {
    fields: items,
    append,
    remove,
  } = useFieldArray({
    name: `sections.${index}.items`,
    control: form.control,
  })

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name={`sections.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., For the sauce" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sections.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                    <SelectItem value="INSTRUCTIONS">Instructions</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, itemIndex) => (
          <div key={item.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`sections.${index}.items.${itemIndex}.content`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder={
                        form.watch(`sections.${index}.type`) === "INGREDIENTS"
                          ? "e.g., 2 cups flour"
                          : "e.g., Mix all ingredients"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(itemIndex)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ content: "" })}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  )
}