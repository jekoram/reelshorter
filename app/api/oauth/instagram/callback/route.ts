import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

const GRAPH_API_VERSION = "v21.0"
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

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

    // 1. Facebook 토큰 교환
    const tokenParams = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    })

    const tokenRes = await fetch(`${GRAPH_URL}/oauth/access_token?${tokenParams}`)
    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error("Facebook token exchange failed:", err)
      throw new Error("토큰 교환 실패")
    }
    const tokenData = await tokenRes.json()
    const fbAccessToken = tokenData.access_token

    // 디버그: 토큰 정보 확인
    console.log("Token data keys:", Object.keys(tokenData))

    // 디버그: 토큰 소유자 확인
    const meRes = await fetch(`${GRAPH_URL}/me?fields=id,name&access_token=${fbAccessToken}`)
    const meData = await meRes.json()
    console.log("Token owner (/me):", JSON.stringify(meData))

    // 디버그: 토큰 권한 확인
    const permRes = await fetch(`${GRAPH_URL}/me/permissions?access_token=${fbAccessToken}`)
    const permData = await permRes.json()
    console.log("Token permissions:", JSON.stringify(permData))

    // 2. 토큰 검사: 어떤 자산에 접근 가능한지 확인
    const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
    const debugRes = await fetch(
      `${GRAPH_URL}/debug_token?input_token=${fbAccessToken}&access_token=${appToken}`
    )
    const debugData = debugRes.ok ? await debugRes.json() : null
    console.log("Debug token:", JSON.stringify(debugData, null, 2))

    // granular_scopes에서 허용된 Page ID 추출
    let igAccountId: string | null = null
    const granularScopes = debugData?.data?.granular_scopes || []

    // pages_show_list scope에서 Page ID 찾기
    const pagesScope = granularScopes.find(
      (s: { scope: string; target_ids?: string[] }) => s.scope === "pages_show_list"
    )
    const grantedPageIds: string[] = pagesScope?.target_ids || []
    console.log("Granted page IDs:", grantedPageIds)

    // instagram_basic scope에서 IG Account ID 찾기
    const igScope = granularScopes.find(
      (s: { scope: string; target_ids?: string[] }) => s.scope === "instagram_basic"
    )
    const grantedIgIds: string[] = igScope?.target_ids || []
    console.log("Granted IG IDs:", grantedIgIds)

    // 방법 1: 허용된 Page ID로 직접 instagram_business_account 조회
    for (const pageId of grantedPageIds) {
      const pageRes = await fetch(
        `${GRAPH_URL}/${pageId}?fields=id,name,instagram_business_account&access_token=${fbAccessToken}`
      )
      if (pageRes.ok) {
        const pageData = await pageRes.json()
        console.log(`Page ${pageId}:`, JSON.stringify(pageData))
        if (pageData.instagram_business_account?.id) {
          igAccountId = pageData.instagram_business_account.id
          break
        }
      }
    }

    // 방법 2: granular_scopes에서 직접 IG ID를 받은 경우
    if (!igAccountId && grantedIgIds.length > 0) {
      igAccountId = grantedIgIds[0]
      console.log("Using IG ID from granular_scopes:", igAccountId)
    }

    // 방법 3: /me/accounts 폴백
    if (!igAccountId) {
      const pagesRes = await fetch(
        `${GRAPH_URL}/me/accounts?fields=id,name,instagram_business_account&access_token=${fbAccessToken}`
      )
      const pagesData = pagesRes.ok ? await pagesRes.json() : { data: [] }
      console.log("Fallback /me/accounts:", JSON.stringify(pagesData))

      const pageWithIg = pagesData.data?.find(
        (page: { instagram_business_account?: { id: string } }) => page.instagram_business_account
      )
      if (pageWithIg?.instagram_business_account?.id) {
        igAccountId = pageWithIg.instagram_business_account.id
      }
    }

    if (!igAccountId) {
      console.error("No Instagram Business Account found via any path")
      return NextResponse.redirect(`${redirectUrl}?error=instagram_no_business`)
    }

    console.log("Found IG Account ID:", igAccountId)

    // 3. Instagram 계정 정보 조회
    const igUserRes = await fetch(
      `${GRAPH_URL}/${igAccountId}?fields=id,username&access_token=${fbAccessToken}`
    )
    if (!igUserRes.ok) {
      throw new Error("Instagram 계정 정보 조회 실패")
    }
    const igUser = await igUserRes.json()

    // 4. 장기 토큰 변환 (60일)
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: fbAccessToken,
    })

    const longLivedRes = await fetch(`${GRAPH_URL}/oauth/access_token?${longLivedParams}`)
    let finalToken = fbAccessToken
    let expiresIn = 3600

    if (longLivedRes.ok) {
      const longLivedData = await longLivedRes.json()
      finalToken = longLivedData.access_token
      expiresIn = longLivedData.expires_in || 5184000 // 기본 60일
    }

    // 5. DB 저장
    await prisma.connection.upsert({
      where: { userId_platform: { userId: state, platform: "instagram" } },
      update: {
        encryptedAccessToken: encrypt(finalToken),
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        platformUserId: igAccountId,
        platformUsername: igUser.username || igUser.name,
        isActive: true,
      },
      create: {
        userId: state,
        platform: "instagram",
        encryptedAccessToken: encrypt(finalToken),
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        platformUserId: igAccountId,
        platformUsername: igUser.username || igUser.name,
      },
    })

    return NextResponse.redirect(`${redirectUrl}?success=instagram`)
  } catch (err) {
    console.error("Instagram OAuth error:", err)
    return NextResponse.redirect(`${redirectUrl}?error=instagram_failed`)
  }
}
