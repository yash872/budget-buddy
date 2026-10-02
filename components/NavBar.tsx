"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "./Logo";
import ProfileBadge from "./ProfileBadge";

const LINKS = [
  { href: "/", label: "Log" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-900">
          <Logo size={32} />
          <span className="hidden sm:inline">Budget Buddy</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-emerald-50/80 p-1 text-sm font-medium">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-full px-3 py-1.5 transition",
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-800 hover:bg-emerald-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ProfileBadge />
      </div>
    </header>
  );
}
