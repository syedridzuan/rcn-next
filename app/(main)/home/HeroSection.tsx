// app/(main)/home/HeroSection.tsx

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[500px] mb-12 overflow-hidden text-center">
      {/* Background image as a cover */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero/hero-bg.webp')" }}
      />

      {/* Optional overlay to darken or tint the background */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Resepi Teruji, Masak dengan Yakin bersama Che Nom
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Cipta hidangan terbaik dengan resepi berkualiti yang pasti menjadi.
        </p>

        <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
          <Link href="/resepi">Terokai Resipi</Link>
        </Button>
      </div>
    </section>
  );
}
