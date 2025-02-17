'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X, User } from 'lucide-react'
import { Dropdown } from './Dropdown'
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CategoryDropdown } from "@/components/categories/category-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
            ResepiCheNom
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors text-base">
              Laman Utama
            </Link>
            <Dropdown
              title="Resipi"
              items={[
                { label: 'Semua Resipi', href: '/resipi' },
                { label: 'Resipi Terbaru', href: '/resipi/terbaru' },
                { label: 'Resipi Popular', href: '/resipi/popular' },
              ]}
            />
            <CategoryDropdown />
            <Dropdown
              title="Koleksi Khas"
              items={[
                { label: 'Raya', href: '/koleksi-khas/raya' },
                { label: 'Ramadan', href: '/koleksi-khas/ramadan' },
                { label: 'Tahun Baru', href: '/koleksi-khas/tahun-baru' },
              ]}
            />
            <Link href="/video-resipi" className="text-gray-600 hover:text-orange-600 transition-colors text-base">
              Video Resipi
            </Link>
            <Link 
              href="/cari"
              className="text-gray-600 hover:text-orange-600 transition-colors focus:outline-none"
              aria-label="Search recipes"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-orange-600 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user?.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Akaun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resipi-saya" className="cursor-pointer">Resipi Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tetapan" className="cursor-pointer">Tetapan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Log Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                Log Masuk
              </button>
            )}

            <Link 
              href="/hantar-resipi" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Hantar Resipi Anda
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-orange-600 transition-colors focus:outline-none mr-4"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 bg-white border-t border-gray-200">
            <Link href="/" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Laman Utama
            </Link>
            <Link href="/resipi" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Resipi
            </Link>
            <Link href="/kategori" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Kategori
            </Link>
            <Link href="/koleksi-khas" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Koleksi Khas
            </Link>
            <Link href="/video-resipi" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Video Resipi
            </Link>

            {/* Mobile User Menu */}
            {session ? (
              <>
                <div className="py-2 px-4 text-gray-600 border-t border-gray-100 mt-2">
                  Selamat datang, {session.user?.name}
                </div>
                <Link href="/profil" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  Profil
                </Link>
                <Link href="/resipi-saya" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  Resipi Saya
                </Link>
                <Link href="/tetapan" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  Tetapan
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Log Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                Log Masuk
              </button>
            )}

            <Link href="/hantar-resipi" className="block py-2 px-4 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Hantar Resipi Anda
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

