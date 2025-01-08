import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  BookmarkIcon,
  Shield,
  ChevronRight,
  Bell,
  CreditCard,
} from "lucide-react";

// Jenis bahagian akaun untuk organisasi lebih baik
interface AccountSection {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
}

// Definisi bahagian-bahagian akaun
const accountSections: AccountSection[] = [
  {
    title: "Profil",
    description: "Kemaskini maklumat peribadi anda dan imej profil.",
    href: "/account/profile",
    icon: UserCircle,
    buttonText: "Lihat & Sunting Profil",
  },
  {
    title: "Notifikasi",
    description: "Urus tetapan notifikasi anda.",
    href: "/account/notifications",
    icon: Bell,
    buttonText: "Urus Notifikasi",
  },
  {
    title: "Resepi Disimpan",
    description: "Akses dan urus semua resepi yang telah anda simpan.",
    href: "/account/saved",
    icon: BookmarkIcon,
    buttonText: "Lihat Resepi Disimpan",
  },
  {
    title: "Keselamatan",
    description: "Tukar kata laluan anda dan tingkatkan keselamatan akaun.",
    href: "/account/security",
    icon: Shield,
    buttonText: "Kemaskini Keselamatan",
  },
  {
    title: "Langganan",
    description: "Urus langganan dan kaedah pembayaran anda.",
    href: "/account/subscriptions",
    icon: CreditCard,
    buttonText: "Urus Langganan",
  },
];

export default async function AccountPage() {
  // Semak pengesahan
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Tajuk Halaman */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Akaun Saya
          </h1>
          <p className="mt-2 text-muted-foreground">
            Urus profil anda, resepi yang disimpan, serta tetapan keselamatan
            akaun.
          </p>
        </div>

        {/* Susun atur Bahagian Akaun */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accountSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.href}
                className="relative group hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="tracking-tight">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Penerangan */}
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                  {/* Butang Tindakan */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link
                      href={section.href}
                      className="flex items-center justify-between"
                    >
                      {section.buttonText}
                      <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bahagian Maklumat Tambahan (Pilihan) */}
        <div className="rounded-lg border bg-card text-card-foreground p-6">
          <h2 className="text-lg font-semibold mb-2">Perlu Bantuan?</h2>
          <p className="text-sm text-muted-foreground">
            Jika anda mempunyai sebarang soalan atau memerlukan bantuan mengenai
            tetapan akaun anda, sila hubungi pasukan sokongan kami.
          </p>
        </div>
      </div>
    </Shell>
  );
}
