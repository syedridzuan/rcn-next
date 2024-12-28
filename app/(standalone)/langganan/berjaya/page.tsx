"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BerjayaLanggananPage() {
  return (
    <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Terima kasih kerana melanggan!
          </CardTitle>
          <CardDescription>
            Langganan anda telah berjaya diproses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>
            Kami akan menghantar langkah seterusnya melalui e-mel. Sila semak
            emel anda untuk menetapkan kata laluan dan melengkapkan akaun anda.
          </p>
          <p>
            Jika anda tidak menerima e-mel dalam beberapa minit, sila semak
            folder “Spam” atau “Promosi.”
          </p>

          <Button
            variant="default"
            onClick={() => {
              // E.g., take user back to main page or somewhere else
              window.location.href = "/";
            }}
          >
            Kembali ke Laman Utama
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
