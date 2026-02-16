"use client"

import { useRouter } from "next/navigation"
import { PlatformCard } from "@/components/dashboard/platform-card"
import type { ConnectionInfo } from "@/types"

interface PlatformStatusSectionProps {
  connections: ConnectionInfo[]
}

export function PlatformStatusSection({ connections }: PlatformStatusSectionProps) {
  const router = useRouter()

  const youtubeConnection = connections.find((c) => c.platform === "youtube")
  const instagramConnection = connections.find((c) => c.platform === "instagram")

  const handleConnect = (platform: "youtube" | "instagram") => {
    router.push(`/dashboard/connections?connect=${platform}`)
  }

  const handleDisconnect = async (platform: "youtube" | "instagram") => {
    const confirmed = window.confirm(
      `${platform === "youtube" ? "YouTube" : "Instagram"} 연결을 해제하시겠습니까?`
    )
    if (!confirmed) return

    try {
      const response = await fetch(`/api/oauth/${platform}/disconnect`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect")
      }

      router.refresh()
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error)
    }
  }

  return (
    <div className="space-y-3">
      <PlatformCard
        platform="youtube"
        isConnected={youtubeConnection?.isActive ?? false}
        username={youtubeConnection?.platformUsername ?? undefined}
        onConnect={() => handleConnect("youtube")}
        onDisconnect={() => handleDisconnect("youtube")}
      />
      <PlatformCard
        platform="instagram"
        isConnected={instagramConnection?.isActive ?? false}
        username={instagramConnection?.platformUsername ?? undefined}
        onConnect={() => handleConnect("instagram")}
        onDisconnect={() => handleDisconnect("instagram")}
      />
    </div>
  )
}
