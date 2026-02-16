"use client"

import { ExternalLink } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { PublishLogEntry } from "@/types"

interface HistoryTableProps {
  logs: PublishLogEntry[]
}

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
}

const statusStyles: Record<string, { label: string; className: string }> = {
  success: { label: "성공", className: "bg-green-50 text-green-700" },
  failed: { label: "실패", className: "bg-red-50 text-red-700" },
  pending: { label: "진행중", className: "bg-yellow-50 text-yellow-700" },
}

export function HistoryTable({ logs }: HistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">아직 게시 이력이 없습니다.</p>
        <p className="text-gray-300 text-xs mt-1">영상을 업로드하면 여기에 이력이 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">제목</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">플랫폼</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">상태</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">날짜</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">링크</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const status = statusStyles[log.status] || statusStyles.pending
            return (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 truncate block max-w-[200px]">
                    {log.videoTitle}
                  </span>
                  {log.errorMessage && (
                    <span className="text-xs text-red-500 truncate block max-w-[200px]">
                      {log.errorMessage}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {platformLabels[log.platform] || log.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {formatDateTime(new Date(log.publishedAt))}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {log.platformUrl ? (
                    <a
                      href={log.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
