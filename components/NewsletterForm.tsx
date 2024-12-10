'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      console.log('Newsletter submission response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        const error = await response.json()
        console.error('Newsletter error:', error)
        setStatus('error')
      }
    } catch (error) {
      console.error('Newsletter submission failed:', error)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Alamat e-mel anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow"
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Menghantar...' : 'Langgan'}
        </Button>
      </div>
      {status === 'success' && (
        <p className="text-green-600 mt-2">Terima kasih kerana melanggan!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 mt-2">Maaf, terdapat ralat. Sila cuba lagi.</p>
      )}
    </form>
  )
}

