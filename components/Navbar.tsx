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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Finance Assistant
            </span>
          </Link>

          <nav className="hidden space-x-4 sm:flex">
            <Link
              href="/dashboard"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isDashboardActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isTransactionsActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              Transactions
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {userName && (
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:inline-block">
              {userName}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Mobile nav bar links */}
      <div className="flex border-t border-gray-200 px-4 py-2 sm:hidden dark:border-gray-800">
        <Link
          href="/dashboard"
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded ${
            isDashboardActive
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded ${
            isTransactionsActive
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Transactions
        </Link>
      </div>
    </header>
  );
}
