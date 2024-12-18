'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setStatus('error')
        // Either show specific validation errors or a generic error
        if (errorData.details) {
          const firstError = errorData.details[0]?.message || "Validation error"
          setErrorMessage(firstError)
        } else {
          setErrorMessage(errorData.error || "Failed to send message")
        }
        return
      }

      // If successful
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (error: any) {
      console.error('Contact form submission failed:', error)
      setStatus('error')
      setErrorMessage('Unknown error occurred. Please try again later.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Hubungi Kami</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mel
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mesej
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          ></textarea>
        </div>

        {status === 'error' && (
          <p className="text-red-600 mb-4">{errorMessage}</p>
        )}

        {status === 'success' && (
          <p className="text-green-600 mb-4">Terima kasih! Mesej anda telah dihantar.</p>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Menghantar...' : 'Hantar'}
        </button>
      </form>
    </div>
  )
}