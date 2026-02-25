import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getInstagramUser,
} from "@/lib/instagram"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state") // userId
  const error = searchParams.get("error")

  const baseUrl = process.env.NEXTAUTH_URL
  const redirectUrl = `${baseUrl}/dashboard/connections`

  if (error || !code || !state) {
    return NextResponse.redirect(`${redirectUrl}?error=instagram_denied`)
  }

  try {
    const redirectUri = `${baseUrl}/api/oauth/instagram/callback`

    // 1. 단기 토큰 교환
    const shortLived = await exchangeCodeForToken(code, redirectUri)

    // 2. 장기 토큰 변환 (60일)
    const longLived = await exchangeForLongLivedToken(shortLived.access_token)

    // 3. 유저 정보 조회
    const igUser = await getInstagramUser(longLived.access_token)

    // 4. DB 저장
    await prisma.connection.upsert({
      where: { userId_platform: { userId: state, platform: "instagram" } },
      update: {
        encryptedAccessToken: encrypt(longLived.access_token),
        tokenExpiresAt: new Date(Date.now() + longLived.expires_in * 1000),
        platformUserId: igUser.id,
        platformUsername: igUser.username,
        isActive: true,
      },
      create: {
        userId: state,
        platform: "instagram",
        encryptedAccessToken: encrypt(longLived.access_token),
        tokenExpiresAt: new Date(Date.now() + longLived.expires_in * 1000),
        platformUserId: igUser.id,
        platformUsername: igUser.username,
      },
    })

    return NextResponse.redirect(`${redirectUrl}?success=instagram`)
  } catch (err) {
    console.error("Instagram OAuth error:", err)
    return NextResponse.redirect(`${redirectUrl}?error=instagram_failed`)
  }
}
