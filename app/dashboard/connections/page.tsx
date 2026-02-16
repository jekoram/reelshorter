import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ConnectionsClient } from "./connections-client"

interface ConnectionsPageProps {
  searchParams: { success?: string; error?: string }
}

export default async function ConnectionsPage({ searchParams }: ConnectionsPageProps) {
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

  const youtubeConnection = connections.find((c) => c.platform === "youtube")
  const instagramConnection = connections.find((c) => c.platform === "instagram")

  // 메시지 매핑
  const successMessages: Record<string, string> = {
    youtube: "YouTube가 성공적으로 연결되었습니다!",
  }

  const errorMessages: Record<string, string> = {
    youtube_denied: "YouTube 연결이 취소되었습니다.",
    youtube_failed: "YouTube 연결에 실패했습니다. 다시 시도해주세요.",
  }

  const successMessage = searchParams.success
    ? successMessages[searchParams.success] || null
    : null
  const errorMessage = searchParams.error
    ? errorMessages[searchParams.error] || "연결 중 오류가 발생했습니다."
    : null

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">플랫폼 연결</h1>
      <p className="text-gray-500 mb-8">
        영상을 게시할 플랫폼을 연결하세요.
      </p>

      {/* 성공/에러 메시지 */}
      {successMessage && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-6">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* YouTube */}
        <ConnectionsClient
          platform="youtube"
          isConnected={!!youtubeConnection?.isActive}
          username={youtubeConnection?.platformUsername || undefined}
          connectUrl="/api/oauth/youtube"
          disabled={false}
        />

        {/* Instagram (Coming Soon) */}
        <ConnectionsClient
          platform="instagram"
          isConnected={!!instagramConnection?.isActive}
          username={instagramConnection?.platformUsername || undefined}
          connectUrl="/api/oauth/instagram"
          disabled={true}
        />
      </div>
    </div>
  )
}
