'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createRecipe, updateRecipe } from '@/app/dashboard/recipes/actions'
import { toast } from 'sonner'

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  cookTime: z.coerce.number().min(1, 'Cook time is required'),
  prepTime: z.coerce.number().min(1, 'Prep time is required'),
  servings: z.coerce.number().min(1, 'Number of servings is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  categoryId: z.string().min(1, 'Category is required'),
  sections: z.array(z.object({
    title: z.string().min(1, 'Section title is required'),
    type: z.string().min(1, 'Section type is required'),
    items: z.array(z.object({
      content: z.string().min(1, 'Item content is required')
    }))
  }))
})

type RecipeFormData = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  categories: {
    id: string
    name: string
  }[]
  initialData?: RecipeFormData
  recipeId?: string
}

export function RecipeForm({ categories, initialData, recipeId }: RecipeFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      language: 'en',
      cookTime: 0,
      prepTime: 0,
      servings: 2,
      difficulty: 'EASY',
      sections: []
    }
  })

  const { fields: sections, append: appendSection, remove: removeSection } = 
    useFieldArray({
      name: 'sections',
      control: form.control
    })

  async function onSubmit(data: RecipeFormData) {
    try {
      setIsPending(true)
      if (recipeId) {
        await updateRecipe(recipeId, data)
        toast.success('Recipe updated successfully')
      } else {
        await createRecipe(data)
        toast.success('Recipe created successfully')
      }
      router.push('/dashboard/recipes')
    } catch (error) {
      toast.error(recipeId ? 'Failed to update recipe' : 'Failed to create recipe')
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ms">Malay</SelectItem>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        {/* Recipe Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recipe Sections</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSection({
                title: '',
                type: 'INGREDIENTS',
                items: [{ content: '' }]
              })}
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending 
              ? (recipeId ? 'Updating...' : 'Creating...') 
              : (recipeId ? 'Update Recipe' : 'Create Recipe')
            }
          </Button>
        </div>
      </form>
    </Form>
  )
}

function RecipeSection({ form, index, onRemove }: {
  form: any
  index: number
  onRemove: () => void
}) {
  const { fields: items, append, remove } = useFieldArray({
    name: `sections.${index}.items`,
    control: form.control
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
        >
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
                        form.watch(`sections.${index}.type`) === 'INGREDIENTS'
                          ? 'e.g., 2 cups flour'
                          : 'e.g., Mix all ingredients'
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
          onClick={() => append({ content: '' })}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  )
} 