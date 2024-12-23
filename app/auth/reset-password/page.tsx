// app/auth/reset-password/page.tsx
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// This could be a server action, or an endpoint (fetch POST /api/auth/reset-password)
async function resetPassword(token: string, newPassword: string) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to reset password.")
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirmPass) {
      toast.error("Kata laluan tidak sepadan.")
      return
    }
    setIsSubmitting(true)
    try {
      await resetPassword(token, password)
      toast.success("Kata laluan anda telah berjaya dikemas kini. Sila log masuk.")
      router.push("/auth/signin")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-4 border rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Tetapan Semula Kata Laluan</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Sila masukkan kata laluan baharu anda. Token: {token ? "(OK)" : "(Tiada token)"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">Kata Laluan Baharu</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirm">Sahkan Kata Laluan Baharu</Label>
          <Input
            id="confirm"
            type="password"
            required
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isSubmitting || !token} className="w-full">
          {isSubmitting ? "Menetapkan..." : "Tetapkan Semula Kata Laluan"}
        </Button>
      </form>
    </div>
  )
}