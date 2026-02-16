"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToYouTube } from "@/lib/youtube"
import { FILE_CONSTRAINTS } from "@/lib/validators"

interface PublishResult {
  success: boolean
  results: { platform: string; success: boolean; url?: string; error?: string }[]
  message: string
}

export async function publishVideo(formData: FormData): Promise<PublishResult> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      success: false,
      results: [],
      message: "로그인이 필요합니다.",
    }
  }

  const file = formData.get("file") as File | null
  const title = formData.get("title") as string | null
  const description = (formData.get("description") as string) || ""
  const platforms = formData.getAll("platforms") as string[]

  // 입력 검증
  if (!file) {
    return {
      success: false,
      results: [],
      message: "업로드할 파일을 선택해주세요.",
    }
  }

  if (!title || title.trim().length === 0) {
    return {
      success: false,
      results: [],
      message: "제목을 입력해주세요.",
    }
  }

  if (platforms.length === 0) {
    return {
      success: false,
      results: [],
      message: "게시할 플랫폼을 선택해주세요.",
    }
  }

  // 파일 크기 검증
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    return {
      success: false,
      results: [],
      message: "파일 크기가 너무 큽니다. 최대 499MB까지 업로드할 수 있어요.",
    }
  }

  // 파일 형식 검증
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(file.type)
  const isValidExt = FILE_CONSTRAINTS.allowedExtensions.includes(ext)

  if (!isValidType && !isValidExt) {
    return {
      success: false,
      results: [],
      message: "지원하지 않는 파일 형식입니다. MP4, MOV, WebM 파일만 업로드할 수 있어요.",
    }
  }

  // 파일을 Buffer로 변환
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

  for (const platform of platforms) {
    if (platform === "youtube") {
      try {
        const result = await uploadToYouTube(session.user.id, {
          title: title.trim(),
          description: description.trim(),
          file: buffer,
          mimeType: file.type || "video/mp4",
        })

        await prisma.publishLog.create({
          data: {
            userId: session.user.id,
            platform: "youtube",
            videoTitle: title.trim(),
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

        await prisma.publishLog.create({
          data: {
            userId: session.user.id,
            platform: "youtube",
            videoTitle: title.trim(),
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
    } else if (platform === "instagram") {
      results.push({
        platform: "instagram",
        success: false,
        error: "Instagram 업로드는 아직 지원하지 않습니다.",
      })
    }
  }

  const allSuccess = results.every((r) => r.success)
  const anySuccess = results.some((r) => r.success)

  return {
    success: anySuccess,
    results,
    message: allSuccess
      ? "모든 플랫폼에 게시되었습니다!"
      : anySuccess
        ? "일부 플랫폼에 게시되었습니다."
        : "게시에 실패했습니다.",
  }
}
