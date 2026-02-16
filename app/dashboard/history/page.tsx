import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { HistoryTable } from "@/components/dashboard/history-table"
import type { PublishLogEntry, Platform, PublishStatus } from "@/types"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const logs = await prisma.publishLog.findMany({
    where: { userId: session.user.id },
    orderBy: { publishedAt: "desc" },
    take: 50,
  })

  const logEntries: PublishLogEntry[] = logs.map((log) => ({
    id: log.id,
    platform: log.platform as Platform,
    videoTitle: log.videoTitle,
    status: log.status as PublishStatus,
    errorMessage: log.errorMessage,
    platformUrl: log.platformUrl,
    publishedAt: log.publishedAt.toISOString(),
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">게시 이력</h1>
        <p className="text-gray-500 mt-1">
          업로드한 영상의 게시 상태를 확인하세요.
        </p>
      </div>

      <HistoryTable logs={logEntries} />
    </div>
  )
}
