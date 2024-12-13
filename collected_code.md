# Collected Code

**Starting File:** `app/dashboard/recipes/new/page.tsx`

## `app/dashboard/recipes/new/page.tsx`

```tsx
import { prisma } from '@/lib/db'
import { RecipeForm } from '@/components/dashboard/recipe-form'

export default async function NewRecipePage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        <RecipeForm categories={categories} />
      </div>
    </div>
  )
} ```

## `components/dashboard/recipe-form.tsx`

```tsx
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
} ```

## `app/dashboard/recipes/actions.ts`

```tsx
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { auth } from '@/auth'

interface RecipeFormData {
  title: string
  description: string | null
  language: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  image?: string | null
  categoryId: string
  sections: {
    title: string
    type: string
    items: {
      content: string
    }[]
  }[]
}

export async function createRecipe(data: RecipeFormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a recipe')
  }

  const slug = slugify(data.title)

  try {
    // Check if slug already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug }
    })

    if (existingRecipe) {
      throw new Error('A recipe with this title already exists')
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        language: data.language,
        cookTime: data.cookTime,
        prepTime: data.prepTime,
        servings: data.servings,
        difficulty: data.difficulty,
        image: data.image,
        slug,
        categoryId: data.categoryId,
        userId: session.user.id,
        sections: {
          create: data.sections.map(section => ({
            title: section.title,
            type: section.type,
            items: {
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      }
    })

    if (recipe) {
      revalidatePath('/dashboard/recipes')
      redirect('/dashboard/recipes')
    }
    
  } catch (error) {
    console.error('Create recipe error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create recipe')
  }
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error('You must be logged in to update a recipe')
    }

    // First, delete existing sections and items
    await prisma.recipeItem.deleteMany({
      where: {
        section: {
          recipeId: id
        }
      }
    })
    
    await prisma.recipeSection.deleteMany({
      where: {
        recipeId: id
      }
    })

    await prisma.recipe.update({
      where: { 
        id,
        userId: session.user.id
      },
      data: {
        title: data.title,
        description: data.description,
        language: data.language,
        cookTime: data.cookTime,
        prepTime: data.prepTime,
        servings: data.servings,
        difficulty: data.difficulty,
        image: data.image,
        categoryId: data.categoryId,
        sections: {
          create: data.sections.map(section => ({
            title: section.title,
            type: section.type,
            items: {
              create: section.items.map(item => ({
                content: item.content
              }))
            }
          }))
        }
      }
    })

    revalidatePath('/dashboard/recipes')
  } catch (error) {
    console.error('Update recipe error:', error)
    throw new Error(typeof error === 'string' ? error : 'Failed to update recipe')
  }

  redirect('/dashboard/recipes')
}

export async function deleteRecipe(id: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to delete a recipe')
  }

  await prisma.recipe.delete({
    where: { 
      id,
      userId: session.user.id // Ensure user owns the recipe
    }
  })
  
  revalidatePath('/dashboard/recipes')
} ```

## `auth.ts`

```tsx
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure credentials are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Fetch user from the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with that email");
        }

        if (!user.password) {
          throw new Error("User does not have a password set");
        }

        // Validate password
        const isPasswordValid = await bcryptjs.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Safely handle role (if not defined, default to USER)
        const role = user.role ?? "USER";

        // Return user object for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // When user logs in or refreshes, attach their ID and role to the JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session user includes ID and role
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);```

## `lib/db.ts`

```tsx
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
```

## `lib/utils.ts`

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`
}
```

## `components/ui/textarea.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

## `components/ui/input.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## `components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

