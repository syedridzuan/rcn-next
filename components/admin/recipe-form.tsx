"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

// If you have server actions like createRecipe or updateRecipe, import them:
// import { createRecipe, updateRecipe } from "@/app/admin/recipes/actions";

// ---------------- Zod Schema ----------------
/**
 * This schema:
 *  - transforms empty string => null for numeric fields
 *  - includes text fallback fields for cookTime, prepTime, totalTime, servings
 *  - adds a boolean membersOnly
 */
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  language: z.string().min(1, "Language is required").default("en"),

  // Example: If user types "", transform to null; else parse to number
  cookTime: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }),
  CookTimeText: z.string().optional(),

  prepTime: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }),
  PrepTimeText: z.string().optional(),

  totalTime: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }),
  TotalTimeText: z.string().optional(),

  servings: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }),
  servingsText: z.string().optional(),

  difficulty: z.string().default("EASY"),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]).default("DRAFT"),
  categoryId: z.string().optional(),

  // boolean
  membersOnly: z.boolean().default(false),
  isEditorsPick: z.boolean().default(false),

  // example arrays for sections, tips, tags
  sections: z
    .array(
      z.object({
        title: z.string().min(1, "Section title is required"),
        type: z.enum(["INGREDIENTS", "INSTRUCTIONS"]).default("INGREDIENTS"),
        items: z.array(
          z.object({
            content: z.string().min(1, "Item content is required"),
          })
        ),
      })
    )
    .optional(),
  tips: z.array(z.string().min(1, "Tip cannot be empty")).optional(),
  // If you want to store tags as an array of strings:
  tags: z.array(z.string()).optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

// ---------------- Props & Form Component ----------------

interface RecipeFormProps {
  // For <Select> or category dropdown
  categories?: { id: string; name: string }[];
  // Tag suggestions if needed
  allTagSuggestions?: string[];

  // Pre-populate fields if editing a recipe
  initialData?: Partial<RecipeFormData>;

  // If editing, we have a recipeId
  recipeId?: string;
}

export function RecipeForm({
  categories = [],
  allTagSuggestions = [],
  initialData = {},
  recipeId,
}: RecipeFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Use React Hook Form + Zod
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      language: "en",

      // for numeric columns => default to empty string => transform => null
      cookTime: "",
      CookTimeText: "",
      prepTime: "",
      PrepTimeText: "",
      totalTime: "",
      TotalTimeText: "",
      servings: "",
      servingsText: "",

      difficulty: "EASY",
      status: "DRAFT",
      categoryId: "",
      membersOnly: false,
      isEditorsPick: false,

      sections: [],
      tips: [],
      tags: [],
      ...initialData, // override with your initial data
    },
  });

  // If you have an array of sections or tips
  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    name: "sections",
    control: form.control,
  });

  const {
    fields: tipFields,
    append: appendTip,
    remove: removeTip,
  } = useFieldArray({
    name: "tips",
    control: form.control,
  });

  // If using comma-separated tags, store them in a local state
  const [tagString, setTagString] = useState(
    (initialData.tags || []).join(", ")
  );

  // For demonstration: watch numeric fields if you want to do something with them
  // const watchCookTime = form.watch("cookTime");
  // const watchPrepTime = form.watch("prepTime");
  // ... calculate totalTime or so

  async function onSubmit(data: RecipeFormData) {
    try {
      setIsPending(true);

      // If you're storing tags as an array of strings, parse the user input
      const parsedTags = tagString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      data.tags = parsedTags;

      // 1) If recipeId is present => update
      if (recipeId) {
        // e.g. const result = await updateRecipe(recipeId, data);
        // if (result.success) { toast.success("Recipe updated!"); }
        console.log("[Update Recipe] data =", data);
      } else {
        // 2) else => create
        // e.g. const result = await createRecipe(data);
        // if (result.success) { toast.success("Recipe created!"); }
        console.log("[Create Recipe] data =", data);
      }

      // redirect or do something
      router.push("/admin/recipes");
    } catch (error) {
      console.error(error);
      toast.error(recipeId ? "Failed to update" : "Failed to create");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Recipe Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Full recipe description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* shortDescription */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Input placeholder="One-liner or short excerpt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* membersOnly */}
        <FormField
          control={form.control}
          name="membersOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-medium">
                Members-Only Content?
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* difficulty */}
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Difficulty" />
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

        {/* status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "DRAFT"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="HIDDEN">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* categoryId */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
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

        {/* cookTime & CookTimeText */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g. 45"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="CookTimeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (Text Fallback)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Overnight simmer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* prepTime & PrepTimeText */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g. 15"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="PrepTimeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (Text Fallback)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Soak 2 hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* totalTime & TotalTimeText */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g. 60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="TotalTimeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Time (Text Fallback)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 1 hour total" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* servings & servingsText */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g. 4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servingsText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings (Text Fallback)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 1 big bowl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* isEditorsPick */}
        <FormField
          control={form.control}
          name="isEditorsPick"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-medium">Editor's Pick</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional: sections, tips, tags */}
        <SectionsFieldArray form={form} />
        <TipsFieldArray form={form} />
        <TagsInput
          form={form}
          tagString={tagString}
          setTagString={setTagString}
        />

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
  );
}

// -------------- Example subcomponent for Sections --------------

function SectionsFieldArray({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    name: "sections",
    control: form.control,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recipe Sections</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ title: "", type: "INGREDIENTS", items: [{ content: "" }] })
          }
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {fields.map((section: any, index: number) => (
        <div key={section.id} className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between">
            <div className="flex flex-col w-full space-y-4">
              <FormField
                control={form.control}
                name={`sections.${index}.title`}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bahan-Bahan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`sections.${index}.type`}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Section Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="INGREDIENTS / INSTRUCTIONS" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                        <SelectItem value="INSTRUCTIONS">
                          Instructions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </Button>
          </div>

          <RecipeItemsFieldArray form={form} sectionIndex={index} />
        </div>
      ))}
    </div>
  );
}

// -------------- Example subcomponent for Items in each Section --------------

function RecipeItemsFieldArray({
  form,
  sectionIndex,
}: {
  form: any;
  sectionIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    name: `sections.${sectionIndex}.items`,
    control: form.control,
  });

  return (
    <div className="space-y-2">
      {fields.map((item: any, idx: number) => (
        <div key={item.id} className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.items.${idx}.content`}
            render={({ field }: any) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="e.g. 2 cawan tepung" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(idx)}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ content: "" })}
      >
        <PlusCircle className="w-4 h-4 mr-1" />
        Add Item
      </Button>
    </div>
  );
}

// -------------- Example subcomponent for Tips --------------

function TipsFieldArray({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    name: "tips",
    control: form.control,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tips</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Tip
        </Button>
      </div>

      {fields.map((tip: any, index: number) => (
        <div key={tip.id} className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name={`tips.${index}`}
            render={({ field }: any) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="e.g. Panaskan minyak terlebih dahulu"
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
            onClick={() => remove(index)}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// -------------- Example subcomponent for Tags (comma separated) --------------

function TagsInput({
  form,
  tagString,
  setTagString,
}: {
  form: any;
  tagString: string;
  setTagString: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="space-y-2">
      <FormLabel>Tags (comma separated)</FormLabel>
      <Input
        placeholder="e.g. dessert, sweet, coconut"
        value={tagString}
        onChange={(e) => setTagString(e.target.value)}
      />
    </div>
  );
}
