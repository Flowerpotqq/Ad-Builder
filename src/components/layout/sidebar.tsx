"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  Palette,
  Sparkles,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigation items for the dashboard sidebar */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
  { label: "Templates", href: "/dashboard/templates", icon: FileText },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
  { label: "Visual Studio", href: "/dashboard/visual-studio", icon: Image },
  { label: "Brand Settings", href: "/dashboard/brand", icon: Palette },
];

/** Persistent sidebar navigation for the dashboard */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sparkles className="h-6 w-6 text-nap-navy" />
        <span className="text-lg font-bold text-nap-navy">NAP Email</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-nap-blue/20 text-nap-navy"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="absolute bottom-0 left-0 w-full border-t p-4">
        <p className="text-xs text-muted-foreground">
          Powered by NAP Solutions
        </p>
        <p className="text-xs text-muted-foreground">AI Email Platform v1.0</p>
      </div>
    </aside>
  );
}
