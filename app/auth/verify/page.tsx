import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

interface VerifyPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // Extract the token from searchParams without client hooks
  const token = Array.isArray(searchParams?.token)
    ? searchParams.token[0]
    : searchParams?.token

  if (!token) {
    // No token provided
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Verification Error</h1>
          <p className="mb-6 text-gray-700">No verification token found.</p>
          <a href="/" className="text-blue-600 underline">Go back to homepage</a>
        </div>
      </div>
    )
  }

  // Check the database for the subscriber with this token
  const subscriber = await prisma.subscriber.findUnique({
    where: { verificationToken: token }
  })

  if (!subscriber) {
    // Invalid or expired token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
          <p className="mb-6 text-gray-700">Invalid or expired verification token.</p>
          <a href="/" className="text-blue-600 underline">Go back to homepage</a>
        </div>
      </div>
    )
  }

  if (!subscriber.isVerified) {
    // Mark subscriber as verified
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date()
      }
    })
  }

  // Show success message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">Email Verified</h1>
        <p className="mb-6 text-gray-700">Your email has been successfully verified!</p>
        <a href="/" className="text-blue-600 underline">Go back to homepage</a>
      </div>
    </div>
  )
}