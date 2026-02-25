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

    // 2. Facebook Pages 조회 (직접 역할)
    const pagesRes = await fetch(
      `${GRAPH_URL}/me/accounts?fields=id,name,instagram_business_account&access_token=${fbAccessToken}`
    )
    const pagesData = pagesRes.ok ? await pagesRes.json() : { data: [] }
    console.log("Direct pages:", JSON.stringify(pagesData))

    let pageWithIg = pagesData.data?.find(
      (page: { instagram_business_account?: { id: string } }) => page.instagram_business_account
    )

    // 3. 직접 역할 없으면 Business Manager 경로로 시도
    if (!pageWithIg?.instagram_business_account?.id) {
      console.log("No direct pages, trying Business Manager path...")

      const bizRes = await fetch(
        `${GRAPH_URL}/me/businesses?fields=id,name&access_token=${fbAccessToken}`
      )
      const bizData = bizRes.ok ? await bizRes.json() : { data: [] }
      console.log("Businesses:", JSON.stringify(bizData))

      for (const biz of bizData.data || []) {
        // Business의 소유 페이지에서 Instagram 계정 찾기
        const bizPagesRes = await fetch(
          `${GRAPH_URL}/${biz.id}/owned_pages?fields=id,name,instagram_business_account&access_token=${fbAccessToken}`
        )
        const bizPagesData = bizPagesRes.ok ? await bizPagesRes.json() : { data: [] }
        console.log(`Business ${biz.name} pages:`, JSON.stringify(bizPagesData))

        pageWithIg = bizPagesData.data?.find(
          (page: { instagram_business_account?: { id: string } }) => page.instagram_business_account
        )
        if (pageWithIg?.instagram_business_account?.id) break

        // owned_pages에도 없으면 Business의 Instagram 계정 직접 조회
        const bizIgRes = await fetch(
          `${GRAPH_URL}/${biz.id}/instagram_accounts?fields=id,username&access_token=${fbAccessToken}`
        )
        const bizIgData = bizIgRes.ok ? await bizIgRes.json() : { data: [] }
        console.log(`Business ${biz.name} IG accounts:`, JSON.stringify(bizIgData))

        if (bizIgData.data?.length > 0) {
          const igAccount = bizIgData.data[0]
          // Page 없이 직접 IG 계정으로 진행
          pageWithIg = { instagram_business_account: { id: igAccount.id } }
          break
        }
      }
    }

    if (!pageWithIg?.instagram_business_account?.id) {
      console.error("No Instagram Business Account found via any path")
      return NextResponse.redirect(`${redirectUrl}?error=instagram_no_business`)
    }

    const igAccountId = pageWithIg.instagram_business_account.id
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
