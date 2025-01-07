import { prisma } from "@/lib/db";

interface VerifyPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // 1) Handle the 'token' from the query params
  const token = Array.isArray(searchParams?.token)
    ? searchParams.token[0]
    : searchParams?.token;

  // 2) If no token found
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Ralat Pengesahan</h1>
          <p className="mb-6 text-gray-700">Tiada token pengesahan dijumpai.</p>
          <a href="/" className="text-blue-600 underline">
            Kembali ke laman utama
          </a>
        </div>
      </div>
    );
  }

  // 3) Find the verification token record in DB
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    // 4) Token not found or expired
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Pengesahan Gagal</h1>
          <p className="mb-6 text-gray-700">
            Token pengesahan tidak sah atau telah tamat tempoh.
          </p>
          <a href="/" className="text-blue-600 underline">
            Kembali ke laman utama
          </a>
        </div>
      </div>
    );
  }

  // 5) Get user by email from verification token
  const userEmail = verificationToken.identifier;
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    // No user associated with this token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4">Pengesahan Gagal</h1>
          <p className="mb-6 text-gray-700">
            Tiada pengguna yang dikaitkan dengan token ini.
          </p>
          <a href="/" className="text-blue-600 underline">
            Kembali ke laman utama
          </a>
        </div>
      </div>
    );
  }

  // 6) If user’s email not verified yet, verify it now
  if (!user.emailVerified) {
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        emailVerified: new Date(),
      },
    });
  }

  // 7) Delete the token to prevent reuse
  await prisma.verificationToken.delete({
    where: { token },
  });

  // 8) Success page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">Emel Disahkan</h1>
        <p className="mb-6 text-gray-700">Emel anda telah berjaya disahkan!</p>
        <a href="/" className="text-blue-600 underline">
          Kembali ke laman utama
        </a>
      </div>
    </div>
  );
}
