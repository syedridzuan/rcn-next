import Link from "next/link";
import { User, CreditCard, Settings } from "lucide-react";

const menuItems = [
  { href: "/account", icon: User, label: "Personal Information" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Subscription" },
  { href: "/account/settings", icon: Settings, label: "Account Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-6">
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center p-2 rounded hover:bg-gray-200"
              >
                <item.icon className="mr-2 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
