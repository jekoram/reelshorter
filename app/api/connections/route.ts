import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      platformUsername: true,
      isActive: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ connections })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const platform = request.nextUrl.searchParams.get("platform")

  if (!platform) {
    return NextResponse.json({ error: "플랫폼을 지정해주세요." }, { status: 400 })
  }

  try {
    await prisma.connection.delete({
      where: { userId_platform: { userId: session.user.id, platform: platform } },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Connection delete error:", err)
    return NextResponse.json({ error: "연결 해제에 실패했습니다." }, { status: 500 })
  }
}
