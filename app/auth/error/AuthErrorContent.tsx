"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export default function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'default'

  let title = "Authentication Error"
  let message = "An unknown error occurred. Please try again."

  switch (error) {
    case 'AccessDenied':
      message = "You do not have permission to access this page."
      break
    case 'CredentialsSignin':
      message = "Invalid username or password. Please try again."
      break
    case 'Configuration':
      message = "There was a configuration issue. Please contact support."
      break
    case 'SessionRequired':
      message = "Please sign in to continue."
      break
    // Add more cases if needed
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex space-x-2">
          <Link href="/auth/signin" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
            Try Signing In Again
          </Link>
          <Link href="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}