// components/author-spotlight.tsx
import Image from "next/image"
import Link from "next/link"
import {
  User as UserIcon,
  Instagram,
  Globe,
  ChefHat,
  BookOpen,
  Facebook,
  Music4 as Tiktok,
} from "lucide-react"

interface UserProfile {
  name?: string
  image?: string
  recipeCount?: number
  isTopContributor?: boolean
  instagramHandle?: string
  facebookHandle?: string
  tiktokHandle?: string
  blogUrl?: string
}

// Accept just the `user` instead of `recipe`.
interface AuthorSpotlightProps {
  user?: UserProfile
}

export function AuthorSpotlight({ user }: AuthorSpotlightProps) {
  if (!user) return null

  return (
    <section className="mt-8 p-6 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 shadow-md">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || ""}
            width={80}
            height={80}
            className="rounded-full border-4 border-white shadow-sm"
          />
        )}

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Mengenai Penulis
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            {user.name} ialah seorang penggemar masakan tradisional
            Malaysia yang aktif berkongsi resipi ...
          </p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
              <BookOpen className="w-4 h-4 mr-1" />
              {user.recipeCount ?? 42} Resipi
            </span>
            {user.isTopContributor && (
              <span className="inline-flex items-center px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                <ChefHat className="w-4 h-4 mr-1" />
                Top Contributor
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-sm text-gray-600 mb-4">
            {user.instagramHandle && (
              <a
                href={`https://www.instagram.com/${user.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-orange-600 transition-colors"
              >
                <Instagram className="w-4 h-4 mr-1" />
                @{user.instagramHandle}
              </a>
            )}
            {user.facebookHandle && (
              <a
                href={`https://www.facebook.com/${user.facebookHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-orange-600 transition-colors"
              >
                <Facebook className="w-4 h-4 mr-1" />
                {user.facebookHandle}
              </a>
            )}
            {user.tiktokHandle && (
              <a
                href={`https://www.tiktok.com/@${user.tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-orange-600 transition-colors"
              >
                <Tiktok className="w-4 h-4 mr-1" />
                @{user.tiktokHandle}
              </a>
            )}
            {user.blogUrl && (
              <a
                href={user.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-orange-600 transition-colors"
              >
                <Globe className="w-4 h-4 mr-1" />
                {user.blogUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          <Link
            href={`/profil/${(user.username ?? "").toLowerCase().replace(/\s+/g, "-")}`}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm font-medium"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Lihat profil {user.username}
          </Link>
        </div>
      </div>
    </section>
  )
}