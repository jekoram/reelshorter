"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function DashboardTopBar() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex items-center justify-end gap-4 px-8 py-4 border-b border-gray-200">
      {session?.user?.email && (
        <span className="text-sm text-gray-500 truncate max-w-[200px]">
          {session.user.email}
        </span>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </button>
    </div>
  )
}
