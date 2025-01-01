"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import icons from lucide-react or your icon library of choice
import {
  LayoutDashboard,
  Users,
  Tag,
  List,
  Mail,
  ShieldAlert,
  Book,
  DollarSign,
  // Add any icons you prefer for these items
} from "lucide-react";

const sidebarItems = [
  {
    href: "/admin/subscriptions",
    icon: DollarSign,
    label: "Subscriptions",
  },
  {
    href: "/admin/categories",
    icon: List,
    label: "Categories",
  },
  {
    href: "/admin/guides",
    icon: Book,
    label: "Guides",
  },
  {
    href: "/admin/moderation",
    icon: ShieldAlert,
    label: "Moderation",
  },
  {
    href: "/admin/newsletter",
    icon: Mail,
    label: "Newsletter",
  },
  {
    href: "/admin/recipes",
    icon: List,
    label: "Recipes",
  },
  {
    href: "/admin/tags",
    icon: Tag,
    label: "Tags",
  },
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden w-64 border-r bg-gray-100/40 dark:bg-gray-800/40 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Admin Logo/Title */}
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/admin">
            <LayoutDashboard className="h-6 w-6" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Scrollable list of menu items */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 p-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
