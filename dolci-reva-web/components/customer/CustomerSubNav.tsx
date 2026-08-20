"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/customer/dashboard", label: "Accueil", icon: Home },
  { href: "/customer/bookings", label: "Réservations", icon: CalendarDays },
  { href: "/customer/profile", label: "Profil", icon: UserRound },
] as const;

export function CustomerSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-14 z-40 border-b border-[#12100c]/08 bg-[#faf8f5]/95 backdrop-blur-md md:top-16">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/customer/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors",
                active
                  ? "bg-[#f08400] text-white"
                  : "text-[#12100c]/65 hover:bg-[#fff4e8] hover:text-[#f08400]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
