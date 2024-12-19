"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth"
import { registerAction } from "./actions"

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  })

  // Handle form submission
  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        const result = await registerAction(data)

        if (!result.success) {
          // Show field-specific errors
          if (result.fieldErrors) {
            for (const [field, error] of Object.entries(result.fieldErrors)) {
              form.setError(field as keyof RegisterInput, {
                message: error,
              })
            }
            return
          }

          // Show general error
          toast.error(result.message || "Something went wrong")
          return
        }

        // Registration successful
        toast.success("Account created successfully")
        router.push("/auth/signin")
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter your email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Create a password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the{" "}
                  <Dialog>
                    <DialogTrigger className="text-primary underline">
                      terms and conditions
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                        <DialogDescription className="mt-4">
                          {/* Add your terms content here */}
                          By creating an account, you agree to our terms of service
                          and privacy policy...
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={!form.getValues("terms") || isPending}
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  )
} 