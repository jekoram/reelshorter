"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { disconnectPlatform } from "@/actions/connections"

interface ConnectionsClientProps {
  platform: "youtube" | "instagram"
  isConnected: boolean
  username?: string
  connectUrl: string
  disabled: boolean
}

const PLATFORM_INFO = {
  youtube: { name: "YouTube", icon: "YT", bgColor: "bg-red-100", textColor: "text-red-600" },
  instagram: { name: "Instagram", icon: "IG", bgColor: "bg-pink-100", textColor: "text-pink-600" },
}

export function ConnectionsClient({
  platform,
  isConnected,
  username,
  connectUrl,
  disabled,
}: ConnectionsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const info = PLATFORM_INFO[platform]

  const handleDisconnect = async () => {
    if (!confirm(`${info.name} 연결을 해제하시겠습니까?`)) return

    setIsLoading(true)
    try {
      const result = await disconnectPlatform(platform)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "연결 해제에 실패했습니다.")
      }
    } catch {
      alert("연결 해제 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${info.bgColor} ${info.textColor} flex items-center justify-center font-bold text-sm`}>
            {info.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{info.name}</h3>
              {disabled && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  Coming Soon
                </span>
              )}
            </div>
            {isConnected ? (
              <p className="text-sm text-gray-500">{username || "연결됨"}</p>
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
              <Button
                variant="secondary"
                onClick={handleDisconnect}
                isLoading={isLoading}
              >
                연결 해제
              </Button>
            </>
          ) : (
            <a
              href={disabled ? undefined : connectUrl}
              className={disabled ? "pointer-events-none" : ""}
            >
              <Button disabled={disabled}>
                연결하기
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
