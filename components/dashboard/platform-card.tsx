"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PlatformCardProps {
  platform: "youtube" | "instagram"
  isConnected: boolean
  username?: string
  onConnect: () => void
  onDisconnect: () => void
}

const PLATFORM_INFO = {
  youtube: { name: "YouTube", icon: "🔴", color: "red" as const },
  instagram: { name: "Instagram", icon: "📷", color: "pink" as const },
}

export function PlatformCard({
  platform,
  isConnected,
  username,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const info = PLATFORM_INFO[platform]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{info.name}</h3>
            {isConnected ? (
              <p className="text-sm text-gray-500">{username}</p>
            ) : (
              <p className="text-sm text-gray-400">연결되지 않음</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                연결됨
              </span>
              <Button variant="secondary" onClick={onDisconnect}>
                연결 해제
              </Button>
            </>
          ) : (
            <Button onClick={onConnect}>연결하기</Button>
          )}
        </div>
      </div>
    </Card>
  )
}
