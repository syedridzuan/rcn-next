// Add tip to your form schema
const recipeSchema = z.object({
  // ... existing fields
  tip: z.string().optional(),
  // ... other fields
})

// Update your form component
export function RecipeForm() {
  const form = useForm<RecipeFormValues>({
    defaultValues: {
      // ... existing defaults
      tip: "",
    }
  })

  return (
    <Form {...form}>
      {/* ... existing form fields */}
      
      <FormField
        control={form.control}
        name="tip"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tip Memasak</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Kongsi tip memasak anda..."
                className="h-20"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Tip tambahan untuk membantu pembaca.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* ... rest of the form */}
    </Form>
  )
} 