import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/oauth/youtube/callback`
)

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")  // userId
  const error = searchParams.get("error")

  const baseUrl = process.env.NEXTAUTH_URL
  const redirectUrl = `${baseUrl}/dashboard/connections`

  if (error || !code || !state) {
    return NextResponse.redirect(`${redirectUrl}?error=youtube_denied`)
  }

  try {
    // 토큰 교환
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // 채널 정보
    const youtube = google.youtube({ version: "v3", auth: oauth2Client })
    const channelRes = await youtube.channels.list({ part: ["snippet"], mine: true })
    const channel = channelRes.data.items?.[0]

    // DB 저장
    await prisma.connection.upsert({
      where: { userId_platform: { userId: state, platform: "youtube" } },
      update: {
        encryptedAccessToken: encrypt(tokens.access_token!),
        encryptedRefreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        platformUserId: channel?.id,
        platformUsername: channel?.snippet?.title,
        isActive: true,
      },
      create: {
        userId: state,
        platform: "youtube",
        encryptedAccessToken: encrypt(tokens.access_token!),
        encryptedRefreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        platformUserId: channel?.id,
        platformUsername: channel?.snippet?.title,
      },
    })

    return NextResponse.redirect(`${redirectUrl}?success=youtube`)
  } catch (err) {
    console.error("YouTube OAuth error:", err)
    return NextResponse.redirect(`${redirectUrl}?error=youtube_failed`)
  }
}
