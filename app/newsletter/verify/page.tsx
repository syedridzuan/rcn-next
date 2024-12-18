import { prisma } from '@/lib/db'

interface VerifyPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // Dapatkan token daripada searchParams
  const token = Array.isArray(searchParams?.token)
    ? searchParams.token[0]
    : searchParams?.token

  if (!token) {
    // Tiada token disediakan
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Ralat Pengesahan</h1>
          <p className="mb-6 text-gray-700">Tiada token pengesahan dijumpai.</p>
          <a href="/" className="text-blue-600 underline">Kembali ke laman utama</a>
        </div>
      </div>
    )
  }

  // Cari pelanggan berdasarkan verificationToken
  const subscriber = await prisma.subscriber.findUnique({
    where: { verificationToken: token }
  })

  if (!subscriber) {
    // Token tidak sah atau telah tamat tempoh
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Pengesahan Gagal</h1>
          <p className="mb-6 text-gray-700">Token pengesahan tidak sah atau telah luput.</p>
          <a href="/" className="text-blue-600 underline">Kembali ke laman utama</a>
        </div>
      </div>
    )
  }

  if (!subscriber.isVerified) {
    // Sahkan pelanggan
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date(),
      },
    })
  }

  // Papar mesej kejayaan
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">Langganan Disahkan</h1>
        <p className="mb-6 text-gray-700">
          Emel anda telah berjaya disahkan! Anda kini dilanggan ke surat berita kami.
        </p>
        <a href="/" className="text-blue-600 underline">Kembali ke laman utama</a>
      </div>
    </div>
  )
}
