"use client";

import { useState, useRef } from "react";
import { updateProfile } from "./actions";
import { useFormStatus } from "react-dom";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  instagramHandle: string | null;
  facebookHandle: string | null;
  tiktokHandle: string | null;
  youtubeHandle: string | null;
  blogUrl: string | null;
  username: string | null; // new
  sex: "MALE" | "FEMALE" | null;
  birthdate: string | null; // or Date if you prefer
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sedang menyimpan perubahan..." : "Simpan Perubahan"}
    </Button>
  );
}

export function UpdateProfileForm({ user }: { user: User }) {
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast({
          title: "Profil Dikemaskini",
          description: "Profil anda berjaya dikemaskini.",
          variant: "default",
        });
      } else {
        toast({
          title: "Ralat",
          description: result.error || "Gagal mengemaskini profil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ralat",
        description: "Ralat tidak dijangka berlaku",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <form action={handleSubmit} className="space-y-8">
        {/* Profile Image Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={imagePreview || undefined}
                alt={user.name || "Profil"}
              />
              <AvatarFallback>
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <Label htmlFor="image">Gambar Profil</Label>
              <Input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileRef}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Penuh</Label>
            <Input
              type="text"
              id="name"
              name="name"
              defaultValue={user.name ?? ""}
              placeholder="Masukkan nama anda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nama Pengguna</Label>
            <Input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username ?? ""}
              placeholder="Masukkan nama pengguna anda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Tarikh Lahir</Label>
            <Input
              type="date"
              id="birthdate"
              name="birthdate"
              defaultValue={
                user.birthdate
                  ? new Date(user.birthdate).toISOString().slice(0, 10)
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Jantina</Label>
            <select
              id="sex"
              name="sex"
              defaultValue={user.sex ?? ""}
              className="border px-2 py-1 rounded"
            >
              <option value="">Pilih...</option>
              <option value="MALE">Lelaki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Emel</Label>
            <Input
              type="email"
              id="email"
              value={user.email}
              disabled
              aria-disabled="true"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Pautan Media Sosial</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram</Label>
              <Input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                defaultValue={user?.instagramHandle ?? ""}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookHandle">Facebook</Label>
              <Input
                type="text"
                id="facebookHandle"
                name="facebookHandle"
                defaultValue={user?.facebookHandle ?? ""}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokHandle">TikTok</Label>
              <Input
                type="text"
                id="tiktokHandle"
                name="tiktokHandle"
                defaultValue={user?.tiktokHandle ?? ""}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeHandle">YouTube</Label>
              <Input
                type="text"
                id="youtubeHandle"
                name="youtubeHandle"
                defaultValue={user?.youtubeHandle ?? ""}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="blogUrl">URL Blog</Label>
              <Input
                type="url"
                id="blogUrl"
                name="blogUrl"
                defaultValue={user?.blogUrl ?? ""}
                placeholder="https://blog-anda.com"
              />
            </div>
          </div>
        </div>

        {/* We no longer show user.role or membership plan, etc. */}
        {/* If you want to show membership dates, or skip them, your choice. */}

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="createdAt">Ahli Sejak</Label>
            <Input
              type="text"
              id="createdAt"
              value={formatDate(user.createdAt)}
              disabled
              aria-disabled="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="updatedAt">Kemaskini Terakhir</Label>
            <Input
              type="text"
              id="updatedAt"
              value={formatDate(user.updatedAt)}
              disabled
              aria-disabled="true"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
      <Toaster />
    </>
  );
}
