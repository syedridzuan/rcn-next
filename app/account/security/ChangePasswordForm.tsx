'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { updateUserPassword } from "./actions"
import { toast } from "sonner"

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
})

type FormData = z.infer<typeof passwordSchema>

export function ChangePasswordForm() {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  async function onSubmit(data: FormData) {
    try {
      setIsPending(true)
      await updateUserPassword(data)
      toast.success("Password updated successfully")
      form.reset()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to update password")
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your current password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm your new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  )
} 