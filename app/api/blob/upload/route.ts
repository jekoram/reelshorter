import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { authOptions } from "@/lib/auth"
import { FILE_CONSTRAINTS } from "@/lib/validators"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("uploads/")) {
          throw new Error("Invalid upload path")
        }
        return {
          allowedContentTypes: FILE_CONSTRAINTS.allowedTypes,
          maximumSizeInBytes: FILE_CONSTRAINTS.maxSize,
          addRandomSuffix: true,
        }
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error("Blob token error:", err)
    return NextResponse.json({ error: "업로드 준비에 실패했습니다." }, { status: 400 })
  }
}
