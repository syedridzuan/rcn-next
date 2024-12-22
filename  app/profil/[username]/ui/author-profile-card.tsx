// app/profil/[username]/ui/author-profile-card.tsx

"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Instagram, Globe, Facebook, Music2 } from "lucide-react"

interface AuthorProfileCardProps {
  user: {
    id: string
    name: string | null
    image: string | null
    recipeCount: number
    instagramHandle: string | null
    facebookHandle: string | null
    tiktokHandle: string | null
    blogUrl: string | null
  }
}

export function AuthorProfileCard({ user }: AuthorProfileCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* User Image */}
      {user.image && (
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={user.image}
            alt={user.name ?? "User profile image"}
            fill
            className="object-cover rounded-full border border-gray-200"
          />
        </div>
      )}

      {/* User Info */}
      <div className="flex-1 space-y-3">
        <h2 className="text-xl font-semibold">
          {user.name || "Pengguna Tanpa Nama"}
        </h2>
        <p className="text-sm text-gray-600">
          Telah berkongsi {user.recipeCount} resipi di ResepiCheNom.
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap gap-3 mt-2">
          {user.instagramHandle && (
            <a
              href={`https://instagram.com/${user.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @{user.instagramHandle}
            </a>
          )}
          {user.facebookHandle && (
            <a
              href={`https://facebook.com/${user.facebookHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Facebook className="w-4 h-4" />
              {user.facebookHandle}
            </a>
          )}
          {user.tiktokHandle && (
            <a
              href={`https://www.tiktok.com/@${user.tiktokHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Music2 className="w-4 h-4" />
              @{user.tiktokHandle}
            </a>
          )}
          {user.blogUrl && (
            <a
              href={user.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {user.blogUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}