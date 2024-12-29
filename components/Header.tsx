"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X, User } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryDropdown } from "@/components/categories/category-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            ResepiCheNom
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-4">
            {/* Resipi Dropdown */}
            <Dropdown
              title="Resipi"
              items={[
                { label: "Semua Resipi", href: "/resipi" },
                { label: "Resipi Terbaru", href: "/resipi/terbaru" },
                { label: "Resipi Popular", href: "/resipi/popular" },
              ]}
              className="text-sm"
            />

            {/* Kategori */}
            <CategoryDropdown className="text-sm" />

            {/* Search icon */}
            <Link
              href="/cari"
              className="text-gray-600 hover:text-orange-600 transition-colors focus:outline-none"
              aria-label="Search recipes"
            >
              <Search className="h-4 w-4" />
            </Link>

            {/* If user is logged in, show "Langganan Saya" + profile dropdown */}
            {session ? (
              <>
                {/* Langganan button */}
                <Link
                  href="/account/subscriptions"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Langganan Saya
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-orange-600 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {session.user?.name}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-sm">
                      Akaun Saya
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/profile"
                        className="cursor-pointer text-sm"
                      >
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer text-sm">
                        Tetapan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                    >
                      Log Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* If user is NOT logged in, just show "Log Masuk" button */
              <button
                onClick={() => signIn()}
                className="text-gray-600 hover:text-orange-600 transition-colors text-sm"
              >
                Log Masuk
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-orange-600 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-2 bg-white border-t border-gray-200">
            <Link
              href="/resipi"
              className="block py-2 px-4 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              Resipi
            </Link>
            <Link
              href="/kategori"
              className="block py-2 px-4 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              Kategori
            </Link>

            {session ? (
              <>
                {/* Mobile "Langganan Saya" button */}
                <Link
                  href="/account/subscriptions"
                  className="block py-2 px-4 text-sm bg-orange-500 text-white rounded-full w-fit mx-4 my-2 hover:bg-orange-600 transition-colors"
                >
                  Langganan Saya
                </Link>

                <div className="py-2 px-4 text-gray-600 border-t border-gray-100 mt-2">
                  Selamat datang, {session.user?.name}
                </div>
                <Link
                  href="/account/profile"
                  className="block py-2 px-4 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  Profil
                </Link>
                <Link
                  href="/account"
                  className="block py-2 px-4 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  Tetapan
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 px-4 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Log Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                Log Masuk
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
