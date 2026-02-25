import { prisma } from "./prisma"
import { encrypt, decrypt } from "./encryption"
import { put, del } from "@vercel/blob"

const GRAPH_API_VERSION = "v21.0"
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

// ── Token Refresh (Facebook Login for Business) ──

interface LongLivedToken {
  access_token: string
  token_type: string
  expires_in: number
}

export async function refreshLongLivedToken(token: string): Promise<LongLivedToken> {
  // Facebook Login for Business: fb_exchange_token으로 갱신
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: token,
  })

  const res = await fetch(`${GRAPH_URL}/oauth/access_token?${params}`)

  if (!res.ok) {
    throw new Error("Instagram 토큰 갱신에 실패했습니다.")
  }

  return res.json()
}

// ── Instagram Client (with token refresh) ──

export async function getInstagramAccessToken(userId: string): Promise<{ accessToken: string; igUserId: string }> {
  const connection = await prisma.connection.findUnique({
    where: { userId_platform: { userId, platform: "instagram" } },
  })

  if (!connection || !connection.isActive) {
    throw new Error("Instagram 연결이 필요합니다.")
  }

  let accessToken = decrypt(connection.encryptedAccessToken)

  // 토큰 만료 7일 전부터 갱신 시도
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  if (connection.tokenExpiresAt && connection.tokenExpiresAt < sevenDaysFromNow) {
    try {
      const refreshed = await refreshLongLivedToken(accessToken)
      accessToken = refreshed.access_token

      await prisma.connection.update({
        where: { id: connection.id },
        data: {
          encryptedAccessToken: encrypt(accessToken),
          tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        },
      })
    } catch (err) {
      console.error("Instagram token refresh failed:", err)
    }
  }

  return { accessToken, igUserId: connection.platformUserId! }
}

// ── Reels Upload (3-step) ──

export interface ReelsUploadOptions {
  caption: string
  videoBuffer: Buffer
  mimeType: string
  fileName: string
}

export async function uploadToInstagramReels(userId: string, options: ReelsUploadOptions) {
  const totalStart = Date.now()
  const { accessToken, igUserId } = await getInstagramAccessToken(userId)
  console.log(`[IG Upload] Token fetch: ${Date.now() - totalStart}ms`)

  // Step 1: Vercel Blob에 임시 업로드 (공개 URL 필요)
  const blobStart = Date.now()
  const blob = await put(`instagram-temp/${Date.now()}-${options.fileName}`, options.videoBuffer, {
    access: "public",
    contentType: options.mimeType,
  })
  console.log(`[IG Upload] Blob upload: ${Date.now() - blobStart}ms`)

  try {
    // Step 2: Media Container 생성
    const containerStart = Date.now()
    const containerRes = await fetch(`${GRAPH_URL}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_url: blob.url,
        caption: options.caption || undefined,
        media_type: "REELS",
        access_token: accessToken,
      }),
    })

    if (!containerRes.ok) {
      const error = await containerRes.json()
      console.error("Instagram container creation failed:", error)
      throw new Error(error.error?.message || "Instagram 영상 처리를 시작할 수 없습니다.")
    }

    const { id: containerId } = await containerRes.json()
    console.log(`[IG Upload] Container creation: ${Date.now() - containerStart}ms`)

    // Step 3: 상태 폴링 (최대 120초, 3초 간격)
    const pollStart = Date.now()
    const TIMEOUT = 120_000
    const POLL_INTERVAL = 3_000
    let pollCount = 0

    while (Date.now() - pollStart < TIMEOUT) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
      pollCount++

      const statusRes = await fetch(
        `${GRAPH_URL}/${containerId}?fields=status_code,status&access_token=${accessToken}`
      )
      const statusData = await statusRes.json()

      console.log(`[IG Upload] Poll #${pollCount} (${Date.now() - pollStart}ms): ${statusData.status_code}`)

      if (statusData.status_code === "FINISHED") break
      if (statusData.status_code === "ERROR") {
        throw new Error(statusData.status || "Instagram 영상 처리에 실패했습니다.")
      }
    }

    // 타임아웃 체크
    if (Date.now() - pollStart >= TIMEOUT) {
      throw new Error("Instagram 영상 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")
    }

    console.log(`[IG Upload] Polling total: ${Date.now() - pollStart}ms (${pollCount} polls)`)

    // Step 4: 게시
    const publishStart = Date.now()
    const publishRes = await fetch(`${GRAPH_URL}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    })

    if (!publishRes.ok) {
      const error = await publishRes.json()
      console.error("Instagram publish failed:", error)
      throw new Error(error.error?.message || "Instagram 게시에 실패했습니다.")
    }

    const publishData = await publishRes.json()
    console.log(`[IG Upload] Publish: ${Date.now() - publishStart}ms`)
    console.log(`[IG Upload] TOTAL: ${Date.now() - totalStart}ms`)

    return {
      mediaId: publishData.id,
      url: `https://www.instagram.com/reel/${publishData.id}/`,
    }
  } finally {
    // 임시 파일 정리 (fire-and-forget)
    del(blob.url).catch(() => {
      console.error("Failed to delete temp blob:", blob.url)
    })
  }
}
