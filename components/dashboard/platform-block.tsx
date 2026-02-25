"use client"

import { Card } from "@/components/ui/card"

interface PlatformBlockProps {
  platform: "youtube" | "instagram"
  isConnected: boolean
  enabled: boolean
  onToggle: (enabled: boolean) => void
  title?: string
  onTitleChange?: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  disabled?: boolean
}

const PLATFORM_INFO = {
  youtube: {
    label: "YouTube Shorts",
    icon: "🔴",
    accentBorder: "border-red-500",
    accentBg: "bg-red-50",
  },
  instagram: {
    label: "Instagram Reels",
    icon: "📷",
    accentBorder: "border-purple-500",
    accentBg: "bg-purple-50",
  },
}

export function PlatformBlock({
  platform,
  isConnected,
  enabled,
  onToggle,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  disabled = false,
}: PlatformBlockProps) {
  const info = PLATFORM_INFO[platform]
  const isDisabled = !isConnected || disabled
  const fieldsDisabled = !enabled || isDisabled

  return (
    <Card
      className={`transition-all ${
        enabled && isConnected
          ? `border-l-4 ${info.accentBorder}`
          : "opacity-60"
      }`}
    >
      {/* Header: platform label + toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.icon}</span>
          <span className="text-sm font-semibold text-gray-900">
            {info.label}
          </span>
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              연결됨
            </span>
          ) : (
            <span className="text-xs text-gray-400">미연결</span>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={isDisabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">업로드</span>
        </label>
      </div>

      {!isConnected && (
        <p className="text-xs text-gray-400 mb-3">
          <a href="/dashboard/connections" className="text-blue-600 hover:underline">
            플랫폼을 연결
          </a>
          하면 업로드할 수 있습니다.
        </p>
      )}

      {/* Title (YouTube only) */}
      {platform === "youtube" && (
        <div className="space-y-1.5 mb-3">
          <label className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="영상 제목을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={fieldsDisabled}
          />
        </div>
      )}

      {/* Description / Caption */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          {platform === "instagram" ? "캡션" : "설명"}{" "}
          <span className="text-gray-400">(선택)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={platform === "instagram" ? "캡션을 입력하세요 (해시태그 포함 가능)" : "영상에 대한 설명을 입력하세요"}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={fieldsDisabled}
        />
      </div>
    </Card>
  )
}
