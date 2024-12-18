import { prisma } from '@/lib/db'

interface VerifyPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // Extract the token safely
  const tokenParam = searchParams?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Ralat Pengesahan</h1>
          <p className="mb-6 text-gray-700">Tiada token pengesahan disediakan.</p>
          <a href="/" className="text-blue-600 underline">Kembali ke Laman Utama</a>
        </div>
      </div>
    )
  }

  const subscriber = await prisma.subscriber.findFirst({
    where: { verificationToken: token }
  })

  if (!subscriber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Pengesahan Gagal</h1>
          <p className="mb-6 text-gray-700">Token pengesahan tidak sah atau telah tamat.</p>
          <a href="/" className="text-blue-600 underline">Kembali ke Laman Utama</a>
        </div>
      </div>
    )
  }

  if (!subscriber.isVerified) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date(),
      },
    })
  }

  // Tunjukkan mesej kejayaan
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">Langganan Disahkan</h1>
        <p className="mb-6 text-gray-700">Emel anda telah disahkan! Anda kini dilanggan pada surat berita kami.</p>
        <a href="/" className="text-blue-600 underline">Kembali ke Laman Utama</a>
      </div>
    </div>
  )
}