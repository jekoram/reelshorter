import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToYouTube } from "@/lib/youtube"
import { uploadToInstagramReels } from "@/lib/instagram"
import { del } from "@vercel/blob"
import { Readable } from "stream"

function isOwnBlobUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      url.pathname.startsWith("/uploads/")
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let blobUrl: string | null = null

  try {
    const body = (await request.json()) as {
      blobUrl?: string
      mimeType?: string
      platforms?: { platform: string; title: string; description: string }[]
    }
    const platformEntries = Array.isArray(body.platforms) ? body.platforms : []
    const mimeType = body.mimeType || "video/mp4"

    if (typeof body.blobUrl !== "string" || !isOwnBlobUrl(body.blobUrl)) {
      return NextResponse.json(
        { error: "업로드된 영상 정보가 올바르지 않습니다. 다시 시도해주세요." },
        { status: 400 }
      )
    }
    blobUrl = body.blobUrl

    if (platformEntries.length === 0) {
      return NextResponse.json(
        { error: "게시할 플랫폼을 선택해주세요." },
        { status: 400 }
      )
    }

    for (const entry of platformEntries) {
      if (entry.platform === "youtube" && (!entry.title || entry.title.trim().length === 0)) {
        return NextResponse.json(
          { error: "YouTube 제목을 입력해주세요." },
          { status: 400 }
        )
      }
    }

    const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

    // 각 플랫폼별 업로드
    for (const entry of platformEntries) {
      if (entry.platform === "youtube") {
        try {
          const videoRes = await fetch(blobUrl)
          if (!videoRes.ok || !videoRes.body) {
            throw new Error("업로드된 영상을 불러오지 못했습니다.")
          }
          const result = await uploadToYouTube(session.user.id, {
            title: entry.title.trim(),
            description: entry.description.trim(),
            stream: Readable.fromWeb(videoRes.body as Parameters<typeof Readable.fromWeb>[0]),
            mimeType,
          })

          // PublishLog 기록 (성공)
          await prisma.publishLog.create({
            data: {
              userId: session.user.id,
              platform: "youtube",
              videoTitle: entry.title.trim(),
              status: "success",
              platformVideoId: result.videoId,
              platformUrl: result.url,
            },
          })

          results.push({
            platform: "youtube",
            success: true,
            url: result.url,
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "YouTube 업로드에 실패했습니다."
          console.error("YouTube upload error:", err)

          // PublishLog 기록 (실패)
          await prisma.publishLog.create({
            data: {
              userId: session.user.id,
              platform: "youtube",
              videoTitle: entry.title.trim(),
              status: "failed",
              errorMessage,
            },
          })

          results.push({
            platform: "youtube",
            success: false,
            error: errorMessage,
          })
        }
      } else if (entry.platform === "instagram") {
        try {
          const result = await uploadToInstagramReels(session.user.id, {
            caption: entry.description.trim(),
            videoUrl: blobUrl,
          })

          await prisma.publishLog.create({
            data: {
              userId: session.user.id,
              platform: "instagram",
              videoTitle: entry.title.trim(),
              status: "success",
              platformVideoId: result.mediaId,
              platformUrl: result.url,
            },
          })

          results.push({
            platform: "instagram",
            success: true,
            url: result.url,
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Instagram 업로드에 실패했습니다."
          console.error("Instagram upload error:", err)

          await prisma.publishLog.create({
            data: {
              userId: session.user.id,
              platform: "instagram",
              videoTitle: entry.title.trim(),
              status: "failed",
              errorMessage,
            },
          })

          results.push({
            platform: "instagram",
            success: false,
            error: errorMessage,
          })
        }
      }
    }

    const allSuccess = results.every((r) => r.success)
    const anySuccess = results.some((r) => r.success)

    return NextResponse.json(
      {
        success: anySuccess,
        results,
        message: allSuccess
          ? "모든 플랫폼에 게시되었습니다!"
          : anySuccess
            ? "일부 플랫폼에 게시되었습니다."
            : "게시에 실패했습니다.",
      },
      { status: anySuccess ? 200 : 500 }
    )
  } catch (err) {
    console.error("Publish error:", err)
    return NextResponse.json(
      { error: "게시 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    )
  } finally {
    if (blobUrl) {
      del(blobUrl).catch(() => {
        console.error("Failed to delete temp blob:", blobUrl)
      })
    }
  }
}
