"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"

// Import your server action that creates a recipe
import { createRecipe } from "@/app/dashboard/recipes/actions"

//----------------------------------------------
// 1. Define a zod schema for validation
//----------------------------------------------
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  language: z.string().default("en"),
  cookTime: z.coerce.number().min(1, "Cook time must be >= 1"),
  prepTime: z.coerce.number().min(1, "Prep time must be >= 1"),
  servings: z.coerce.number().min(1, "Servings must be >= 1"),
  difficulty: z.string().default("EASY"),
  categoryId: z.string().nonempty("Please select a category"),
  // “sections” structure (ingredients/instructions)
  sections: z
    .array(
      z.object({
        title: z.string().min(1, "Section title is required"),
        type: z.string().default("INGREDIENTS"),
        items: z.array(
          z.object({
            content: z.string().min(1, "Item content is required"),
          })
        ),
      })
    )
    .default([]),
  tips: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string()).default([]),
  isEditorsPick: z.boolean().default(false),
})

// Type inference for form values
type RecipeFormData = z.infer<typeof recipeSchema>

//----------------------------------------------
// 2. Props interface (e.g., categories from DB)
//----------------------------------------------
interface RecipeCreateFormProps {
  categories: {
    id: string
    name: string
  }[]
}

//----------------------------------------------
// 3. The Create Form Component
//----------------------------------------------
export function RecipeCreateForm({ categories }: RecipeCreateFormProps) {
  const router = useRouter()
  const [showJson, setShowJson] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  // Initialize the form with react-hook-form
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      language: "en",
      cookTime: 10,
      prepTime: 10,
      servings: 2,
      difficulty: "EASY",
      categoryId: categories[0]?.id || "", // pick first as default
      sections: [],
      tips: [],
      tags: [],
      isEditorsPick: false,
    },
  })

  // SECTION field array (for ingredients and instructions)
  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    name: "sections",
    control: form.control,
  })

  // TIPS field array
  const {
    fields: tipFields,
    append: appendTip,
    remove: removeTip,
  } = useFieldArray({
    name: "tips",
    control: form.control,
  })

  // (Optional) If you have “tags” as a separate text input or a comma-based approach,
  // you can handle it similarly, or keep it minimal.

  //----------------------------------------------
  // Form Submission
  //----------------------------------------------
  async function onSubmit(data: RecipeFormData) {
    try {
      const result = await createRecipe(data)
      if (result?.success) {
        toast.success("Recipe created successfully!")
        router.push("/dashboard/recipes") // or wherever you want to go
      } else {
        toast.error("Failed to create recipe.")
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating recipe.")
    }
  }

  //----------------------------------------------
  // 4. Handle “Paste JSON” parsing
  //----------------------------------------------
  function handleJsonParse(e: FormEvent) {
    e.preventDefault()
    try {
      const parsed = JSON.parse(jsonInput)
      form.reset({
        ...form.getValues(),
        title: parsed.title || "",
        description: parsed.description || "",
        shortDescription: parsed.shortDescription || "",
        language: parsed.language || "en",
        cookTime: parsed.cookTime ?? 10,
        prepTime: parsed.prepTime ?? 10,
        servings: parsed.servings ?? 2,
        difficulty: parsed.difficulty || "EASY",
        categoryId: parsed.categoryId || categories[0]?.id || "",
        sections: parsed.sections || [],
        tips: parsed.tips || [],
        tags: parsed.tags || [],
        isEditorsPick: parsed.isEditorsPick || false,
      })
      toast.success("JSON parsed and form populated!")
    } catch (err) {
      toast.error("Invalid JSON")
    }
  }

  //----------------------------------------------
  // RENDER
  //----------------------------------------------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter recipe title..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prep Time */}
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cook Time */}
          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Servings */}
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descriptions */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Full recipe description or storyline..."
                  {...field}
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
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A quick summary of the recipe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SECTION: Ingredients / Instructions */}
        <div className="space-y-4 border p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Recipe Sections</h2>
            <Button
              variant="outline"
              onClick={() =>
                appendSection({
                  title: "",
                  type: "INGREDIENTS",
                  items: [{ content: "" }],
                })
              }
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Section
            </Button>
          </div>

          {sectionFields.map((section, idx) => (
            <div key={section.id} className="p-2 border rounded mb-2">
              <div className="flex justify-between mb-2">
                <FormField
                  control={form.control}
                  name={`sections.${idx}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-1 mr-2">
                      <FormLabel>Section Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Bahan-bahan, Instructions, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sections.${idx}.type`}
                  render={({ field }) => (
                    <FormItem className="w-40">
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                            <SelectItem value="INSTRUCTIONS">Instructions</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="ghost"
                  onClick={() => removeSection(idx)}
                  className="self-end text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Items within this section */}
              <SectionItems
                sectionIndex={idx}
                control={form.control}
              />
            </div>
          ))}
        </div>

        {/* TIPS SECTION */}
        <div className="space-y-4 border p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Tips</h2>
            <Button variant="outline" onClick={() => appendTip("")}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Tip
            </Button>
          </div>

          {tipFields.map((tip, idx) => (
            <div key={tip.id} className="flex items-center gap-2 mt-2">
              <FormField
                control={form.control}
                name={`tips.${idx}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Tip</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Let dough rest for 10 mins"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant="ghost"
                onClick={() => removeTip(idx)}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Toggle for “Paste JSON” */}
        <div className="border p-4 rounded-md">
          <button
            type="button"
            className="underline text-blue-600 mb-2"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? "Hide JSON Input" : "Paste JSON (Advanced)"}
          </button>
          {showJson && (
            <div className="space-y-4">
              <Textarea
                className="h-40"
                placeholder='{"title":"My Recipe","sections":[{"title":"Ingredients","type":"INGREDIENTS","items":[{"content":"1 cup sugar"}]}],...}'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button variant="outline" onClick={handleJsonParse}>
                Parse JSON
              </Button>
            </div>
          )}
        </div>

        {/* Editor's Pick */}
        <FormField
          control={form.control}
          name="isEditorsPick"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 border p-4 rounded-md">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Editor’s Pick</FormLabel>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/recipes")}>
            Cancel
          </Button>
          <Button type="submit">Create Recipe</Button>
        </div>
      </form>
    </Form>
  )
}

//----------------------------------------------
// Helper component to handle items in a section
//----------------------------------------------
function SectionItems({
  sectionIndex,
  control,
}: {
  sectionIndex: number
  control: any
}) {
  const { fields, append, remove } = useFieldArray({
    name: `sections.${sectionIndex}.items`,
    control,
  })

  return (
    <div className="space-y-2 mt-2">
      {fields.map((field, itemIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`sections.${sectionIndex}.items.${itemIndex}.content`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">
                  {`Section ${sectionIndex} - Item ${itemIndex}`}
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2 cups flour" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="ghost"
            onClick={() => remove(itemIndex)}
            className="text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => append({ content: "" })}
        className="mt-2"
      >
        <PlusCircle className="w-4 h-4 mr-1" />
        Add Item
      </Button>
    </div>
  )
}