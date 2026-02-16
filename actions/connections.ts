"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getConnections() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return []
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

  return connections
}

export async function disconnectPlatform(platform: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." }
  }

  try {
    await prisma.connection.delete({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform,
        },
      },
    })

    revalidatePath("/dashboard/connections")
    return { success: true }
  } catch (err) {
    console.error("Disconnect platform error:", err)
    return { success: false, error: "연결 해제에 실패했습니다." }
  }
}
