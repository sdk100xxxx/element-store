"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const subNavLinks = [
  { href: "/store", label: "Store", icon: "store" },
  { href: "/orders", label: "Manage Orders", icon: "orders" },
  { href: "/status", label: "Status", icon: "status" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full bg-element-black/95 backdrop-blur pb-2">
      {/* Top bar: logo left, Join Discord center, Discord + auth right (full width) */}
      <div className="relative flex items-center justify-between border-b border-element-gray-800 px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Element"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="h-6 w-px bg-element-red/60" aria-hidden />
        </Link>
        <a
          href="https://discord.gg/pz3WDMc4Du"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded bg-transparent px-4 py-1.5 text-sm font-medium text-element-red animate-[pulse_2s_ease-in-out_infinite] transition-colors duration-200 hover:bg-element-red hover:text-white hover:animate-none"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Join Discord For Updates
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://discord.gg/pz3WDMc4Du"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#4752C4]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            DISCORD
          </a>
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded bg-element-gray-800" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {["ADMIN", "PARTNER"].includes((session.user as { role?: string })?.role ?? "") && (
                <Link
                  href="/admin"
                  className="rounded bg-element-red px-3 py-1.5 text-sm font-medium text-white transition hover:bg-element-red-dark"
                >
                  ADMIN
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="rounded bg-element-red/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-element-red-dark"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="rounded bg-element-red px-3 py-1.5 text-sm font-medium text-white transition hover:bg-element-red-dark"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded bg-element-red/80 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-element-red-dark"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sub-nav: inside header, centered bar with rounded bottom (like reference) */}
      <div className="px-4 pt-2">
        <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-b-lg border border-t-0 border-element-gray-800 bg-element-gray-900/90 px-6 py-2">
        <div className="flex items-center gap-1">
          {subNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "text-element-red"
                    : "text-gray-300 hover:text-white"
                } ${isActive ? "border-b-2 border-element-red" : ""}`}
              >
                {link.icon === "store" ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                ) : link.icon === "orders" ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
        <form action="/search" method="GET" className="relative">
          <input
            name="q"
            type="search"
            placeholder="Search..."
            className="w-48 rounded border border-element-gray-700 bg-element-gray-800 px-3 py-1.5 pl-8 text-sm text-white placeholder-gray-500 focus:border-element-gray-600 focus:outline-none sm:w-56"
          />
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
        </nav>
      </div>
    </header>
  );
}
