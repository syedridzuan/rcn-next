"use client"

import Link from "next/link";
import { UserCircle, Bell, BookmarkIcon, Shield, CreditCard } from "lucide-react";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/account/profile", icon: UserCircle, label: "Profil" },
  { href: "/account/notifications", icon: Bell, label: "Notifikasi" },
  { href: "/account/saved", icon: BookmarkIcon, label: "Resepi Disimpan" },
  { href: "/account/security", icon: Shield, label: "Keselamatan" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Langganan" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Menu Akaun</h2>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )})}
        </ul>
      </nav>
    </aside>
  );
}
