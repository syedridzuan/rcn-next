// app/auth/forgot-password/page.tsx
"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// This could be a server action, or an endpoint (fetch POST /api/auth/forgot-password)
async function requestPasswordReset(email: string) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to request password reset.")
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email.trim())
      toast.success("Kami telah menghantar pautan tetapan semula kata laluan ke emel anda.")
      router.push("/auth/signin")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-4 border rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Terlupa Kata Laluan</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Masukkan emel anda untuk menerima pautan tetapan semula kata laluan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Emel</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Memproses..." : "Hantar Pautan Reset"}
        </Button>
      </form>
    </div>
  )
}