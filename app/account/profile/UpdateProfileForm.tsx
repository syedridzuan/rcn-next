'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { updateProfile } from "./actions"
import { useFormStatus } from "react-dom"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving changes...' : 'Save changes'}
    </Button>
  )
}

export function UpdateProfileForm({ user }: { user: User }) {
  const [imagePreview, setImagePreview] = useState<string | null>(user.image)
  const fileRef = useRef<HTMLInputElement>(null)
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await updateProfile(formData)
    
    if (result.success) {
      toast.success('Your profile has been updated')
    } else {
      toast.error(result.error || 'Failed to update profile')
    }
  }
  
  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Profile Image Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={imagePreview || undefined} alt={user.name || 'Profile'} />
            <AvatarFallback>
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <Label htmlFor="image">Profile picture</Label>
            <Input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileRef}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            defaultValue={user.name || ''}
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={user.email}
            disabled
            aria-disabled="true"
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            type="text"
            id="role"
            value={user.role}
            disabled
            aria-disabled="true"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="createdAt">Member Since</Label>
            <Input
              type="text"
              id="createdAt"
              value={formatDate(user.createdAt)}
              disabled
              aria-disabled="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="updatedAt">Last Updated</Label>
            <Input
              type="text"
              id="updatedAt"
              value={formatDate(user.updatedAt)}
              disabled
              aria-disabled="true"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

