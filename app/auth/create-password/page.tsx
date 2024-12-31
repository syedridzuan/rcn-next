"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // shadcn hook for toasts

export default function CreatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  // Form fields
  const [nama, setNama] = useState("");
  const [kataLaluan, setKataLaluan] = useState("");
  const [sahKataLaluan, setSahKataLaluan] = useState("");
  const [ralat, setRalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  // Toast
  const { toast } = useToast();

  // Pastikan token wujud
  useEffect(() => {
    if (!token) {
      setRalat("Tiada token diberikan. Tidak dapat menetapkan kata laluan.");
    }
  }, [token]);

  const handleSubmit = async () => {
    // Validasi ringkas
    if (!token) {
      setRalat("Tiada token dijumpai.");
      return;
    }

    if (!nama.trim()) {
      setRalat("Sila masukkan nama penuh anda.");
      return;
    }

    if (!kataLaluan.trim()) {
      setRalat("Sila masukkan kata laluan baharu anda.");
      return;
    }

    if (!sahKataLaluan.trim()) {
      setRalat("Sila sahkan kata laluan anda.");
      return;
    }

    if (kataLaluan !== sahKataLaluan) {
      setRalat("Kata laluan tidak sepadan. Sila pastikan kedua-duanya sama.");
      return;
    }

    // Hantar ke API
    setMemuat(true);
    setRalat(null);

    try {
      const resp = await fetch("/api/auth/create-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: kataLaluan,
          name: nama, // 'name' field in the database
        }),
      });

      if (!resp.ok) {
        const { error } = await resp.json();
        throw new Error(error || "Gagal menetapkan kata laluan.");
      }

      // If success, show Toast and redirect user
      toast({
        title: "Berjaya!",
        description: "Kata laluan anda telah ditetapkan.",
      });

      // Optionally wait a moment for the user to see the toast
      setTimeout(() => {
        // e.g., go to sign in page or user admin
        router.push(
          "/auth/signin?info=Kata laluan telah ditetapkan, sila log masuk."
        );
      }, 1500); // Adjust the delay as you prefer
    } catch (err: any) {
      setRalat(err.message || "Ralat berlaku semasa menetapkan kata laluan.");
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Tetapkan Kata Laluan &amp; Nama Anda</CardTitle>
          <CardDescription>
            Sila masukkan nama penuh serta kata laluan baharu.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {ralat && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{ralat}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Nama Penuh */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Penuh</Label>
              <Input
                id="name"
                type="text"
                value={nama}
                placeholder="Contoh: Ali bin Abu"
                onChange={(e) => setNama(e.target.value)}
              />
            </div>

            {/* Kata Laluan Baharu */}
            <div className="space-y-2">
              <Label htmlFor="password">Kata Laluan Baharu</Label>
              <Input
                id="password"
                type="password"
                value={kataLaluan}
                placeholder="Sekurang-kurangnya 8 aksara"
                onChange={(e) => setKataLaluan(e.target.value)}
              />
            </div>

            {/* Sahkan Kata Laluan */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Sahkan Kata Laluan</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={sahKataLaluan}
                placeholder="Ulangi kata laluan di atas"
                onChange={(e) => setSahKataLaluan(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={memuat || !token}
              className="w-full"
            >
              {memuat ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Tetapkan Kata Laluan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
