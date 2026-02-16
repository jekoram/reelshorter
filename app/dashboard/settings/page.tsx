import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      createdAt: true,
    },
  })

  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
    select: {
      platform: true,
      platformUsername: true,
      isActive: true,
    },
  })

  const publishCount = await prisma.publishLog.count({
    where: { userId: session.user.id, status: "success" },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">계정 정보와 연결 상태를 확인하세요.</p>
      </div>

      {/* 계정 정보 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          계정 정보
        </h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">이메일</dt>
            <dd className="text-sm font-medium text-gray-900">{user?.email}</dd>
          </div>
          {user?.name && (
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">이름</dt>
              <dd className="text-sm font-medium text-gray-900">{user.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">가입일</dt>
            <dd className="text-sm font-medium text-gray-900">
              {user?.createdAt ? formatDate(user.createdAt) : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">게시 횟수</dt>
            <dd className="text-sm font-medium text-gray-900">{publishCount}회</dd>
          </div>
        </dl>
      </section>

      {/* 플랫폼 연결 상태 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            플랫폼 연결
          </h2>
          <Link
            href="/dashboard/connections"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            관리하기
          </Link>
        </div>
        <div className="space-y-3">
          {(["youtube", "instagram"] as const).map((platform) => {
            const conn = connections.find((c) => c.platform === platform)
            const label = platform === "youtube" ? "YouTube" : "Instagram"
            return (
              <div key={platform} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{platform === "youtube" ? "🔴" : "📷"}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    {conn?.platformUsername && (
                      <p className="text-xs text-gray-500">{conn.platformUsername}</p>
                    )}
                  </div>
                </div>
                {conn?.isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    연결됨
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">연결 안 됨</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
