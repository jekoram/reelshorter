"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Link href="/">
        <span className="text-2xl font-bold tracking-[0.3em] uppercase text-white">
          REELSHORTS
        </span>
      </Link>

      {!isLoading && (
        <nav className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
