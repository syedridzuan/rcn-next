// app/newsletter/success/page.tsx

export default function NewsletterSuccessPage() {
  return (
    <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4">Langganan Disahkan!</h1>
        <p className="mb-6 text-gray-700">
          Terima kasih kerana mengesahkan langganan anda. Anda kini akan
          menerima berita dan kemas kini terkini daripada kami melalui e-mel.
        </p>

        <p className="mb-6 text-gray-700">
          Jika anda mempunyai sebarang soalan atau ingin membatalkan langganan,
          sila hubungi kami atau klik pautan batal langganan dalam e-mel yang
          akan datang.
        </p>

        <a
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali ke Laman Utama
        </a>
      </div>
    </main>
  );
}
