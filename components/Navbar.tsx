"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/dashboard/LogoutButton";

interface NavbarProps {
  userName?: string | null;
}

export default function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();

  const isDashboardActive = pathname === "/dashboard";
  const isTransactionsActive = pathname.startsWith("/transactions");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-black text-white shadow-xs">
              F
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Finance Assistant
            </span>
          </Link>

          <nav className="hidden space-x-2 sm:flex">
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDashboardActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isTransactionsActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Transactions
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {userName && (
            <span className="hidden text-xs font-semibold text-slate-700 md:inline-block">
              {userName}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
