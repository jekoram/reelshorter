import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToYouTube } from "@/lib/youtube"
import { uploadToInstagramReels } from "@/lib/instagram"
import { FILE_CONSTRAINTS } from "@/lib/validators"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const platformsRaw = formData.get("platforms") as string | null

    // 입력 검증
    if (!file) {
      return NextResponse.json(
        { error: "업로드할 파일을 선택해주세요." },
        { status: 400 }
      )
    }

    let platformEntries: { platform: string; title: string; description: string }[]
    try {
      platformEntries = JSON.parse(platformsRaw || "[]")
    } catch {
      return NextResponse.json(
        { error: "플랫폼 데이터 형식이 올바르지 않습니다." },
        { status: 400 }
      )
    }

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

    // 파일 크기 검증 (서버 측)
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      return NextResponse.json(
        { error: "파일 크기가 너무 큽니다. 최대 499MB까지 업로드할 수 있어요." },
        { status: 400 }
      )
    }

    // 파일 형식 검증 (서버 측)
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(file.type)
    const isValidExt = FILE_CONSTRAINTS.allowedExtensions.includes(ext)

    if (!isValidType && !isValidExt) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. MP4, MOV, WebM 파일만 업로드할 수 있어요." },
        { status: 400 }
      )
    }

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

    // 각 플랫폼별 업로드
    for (const entry of platformEntries) {
      if (entry.platform === "youtube") {
        try {
          const result = await uploadToYouTube(session.user.id, {
            title: entry.title.trim(),
            description: entry.description.trim(),
            file: buffer,
            mimeType: file.type || "video/mp4",
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
            videoBuffer: buffer,
            mimeType: file.type || "video/mp4",
            fileName: file.name,
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
  }
}
