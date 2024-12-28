// app/(standalone)/langganan/layout.tsx
import { Metadata } from "next";
import Providers from "@/app/providers";

// Optional: Set <title> or other metadata
export const metadata: Metadata = {
  title: "Langganan | Pelan Asas",
};

export default function LanggananLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We do NOT use <html> or <body> here.
  // So the root layout is 100% skipped.
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          maxWidth: "960px",
          width: "100%",
          margin: "1rem",
        }}
      >
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
