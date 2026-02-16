import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UploadForm } from "@/components/dashboard/upload-form"
import { PlatformStatusSection } from "./platform-status-section"
import type { ConnectionInfo } from "@/types"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      platformUsername: true,
      isActive: true,
    },
  })

  const connectionData: ConnectionInfo[] = connections.map((c) => ({
    id: c.id,
    platform: c.platform as "youtube" | "instagram",
    platformUsername: c.platformUsername,
    isActive: c.isActive,
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">영상 업로드</h1>
        <p className="text-gray-500 mt-1">
          영상을 업로드하고 YouTube Shorts와 Instagram Reels에 동시 게시하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload form - takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <UploadForm connections={connectionData} />
        </div>

        {/* Platform connection status - takes 1/3 width */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            플랫폼 연결 상태
          </h2>
          <PlatformStatusSection connections={connectionData} />
        </div>
      </div>
    </div>
  )
}
