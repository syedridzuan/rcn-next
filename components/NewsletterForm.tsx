"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // If the response is not OK => parse error
      if (!response.ok) {
        let errorMessage = "Ralat tidak diketahui.";
        try {
          const errorData = await response.json();
          if (typeof errorData?.error === "string") {
            errorMessage = errorData.error;
          }
        } catch (err) {
          // Fallback: try response.text() or the default message
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          } catch {
            // ignore
          }
        }
        console.error("Newsletter error:", errorMessage);
        setStatus("error");
        setMessage(errorMessage);
        return;
      }

      // If OK, parse success JSON
      let successData: any = null;
      try {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          successData = await response.json();
        }
      } catch (jsonErr) {
        console.warn("No valid JSON in success response:", jsonErr);
      }

      // If successData?.message, we display that
      if (successData?.message) {
        setMessage(successData.message);
      } else {
        // Fallback if no message is returned
        setMessage(
          "Terima kasih kerana melanggan! Kami telah menghantar e-mel ke akaun anda untuk pengesahan."
        );
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Newsletter submission failed:", error);
      setStatus("error");
      setMessage("Ralat semasa menghantar langganan.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Alamat e-mel anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow"
        />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Menghantar..." : "Langgan"}
        </Button>
      </div>

      {message && status !== "idle" && (
        <p
          className={`mt-2 ${
            status === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
