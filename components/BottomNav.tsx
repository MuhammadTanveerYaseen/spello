"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavIcon from "@/components/NavIcon";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "overview" as const },
  { href: "/expenses", label: "Expenses", icon: "expenses" as const },
  { href: "/investors", label: "Funding", icon: "funding" as const },
  { href: "/activity", label: "Log", icon: "log" as const },
  { href: "/profile", label: "Settings", icon: "settings" as const },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pt-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/expenses" && pathname.startsWith("/expenses")) ||
            (item.href === "/investors" && pathname.startsWith("/investors"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition ${
                active ? "text-blue-400" : "text-slate-500"
              }`}
            >
              <NavIcon name={item.icon} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
