import { prisma } from '@/lib/db'

interface VerifyPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const token = Array.isArray(searchParams?.token)
    ? searchParams.token[0]
    : searchParams?.token

  if (!token) {
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

  // Find the verification token record
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    // Token not found or expired
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

  // Identifier is usually the user's email
  const userEmail = verificationToken.identifier
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    // No user found for the given identifier
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
          <p className="mb-6 text-gray-700">No user associated with this token.</p>
          <a href="/" className="text-blue-600 underline">Go back to homepage</a>
        </div>
      </div>
    )
  }

  // If user is not verified, verify them now
  if (!user.emailVerified) {
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        emailVerified: new Date(),
      },
    })
  }

  // Delete the verification token to prevent reuse
  await prisma.verificationToken.delete({
    where: { token },
  })

  // Success page
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