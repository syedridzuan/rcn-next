// app/(main)/home/NewsletterSection.tsx
"use client";

import NewsletterForm from "@/components/NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="bg-orange-100 rounded-lg p-8 mb-16">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Langgan Surat Berita Kami
      </h2>
      <p className="text-center mb-6">
        Dapatkan resipi terbaru dan panduan memasak terus ke peti masuk anda!
      </p>

      <div className="max-w-xl mx-auto">
        {/* 
          If your NewsletterForm is a client component,
          just place it here. 
        */}
        <NewsletterForm />
      </div>
    </section>
  );
}
