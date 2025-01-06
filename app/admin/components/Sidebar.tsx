"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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

const recipeItems = [
  {
    href: "/admin/recipes",
    icon: List,
    label: "All Recipes",
  },
  {
    href: "/admin/recipes/createfromjson",
    icon: List,
    label: "Create From JSON",
  },
  {
    href: "/admin/recipes/ai-audit",
    icon: List,
    label: "AI Audit",
  },
  {
    href: "/admin/recipes/metas",
    icon: List,
    label: "Metas Edit",
  },
  {
    href: "/admin/recipes/generate",
    icon: List,
    label: "Generate Recipe",
  },
  {
    href: "/admin/recipes/drafts",
    icon: List,
    label: "Recipe's Drafts",
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
                  "w-full justify-start text-base",
                  pathname === item.href && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}

            {/* Recipe Section Collapsible */}
            <Collapsible className="space-y-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-base"
                >
                  <div className="flex items-center">
                    <List className="mr-2 h-4 w-4" />
                    <span>Recipes</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {recipeItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start pl-6 text-base",
                      pathname === item.href && "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
