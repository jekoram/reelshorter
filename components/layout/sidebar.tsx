"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { UploadCloud, Link as LinkIcon, Clock, Settings } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Upload", icon: UploadCloud },
  { href: "/dashboard/connections", label: "Connections", icon: LinkIcon },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-[0.2em] text-white">
          REELSHORTS
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

    </aside>
  )
}
