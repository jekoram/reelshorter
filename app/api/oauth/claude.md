# OAuth Context - app/api/oauth/claude.md

> YouTube/Instagram OAuth 연동 작업 시 참조
> 이 파일은 `app/api/oauth/claude.md`에 저장

---

## 개요

```
OAuth 흐름:
1. 유저가 "연결" 버튼 클릭
2. 플랫폼 로그인 페이지로 리다이렉트
3. 유저가 권한 허용
4. 콜백으로 code 받음
5. code → access_token 교환
6. 토큰 암호화 → DB 저장
```

---

## 이 폴더 구조

```
app/api/oauth/
├── claude.md                   ← 이 파일
├── youtube/
│   ├── route.ts                # GET - OAuth 시작
│   └── callback/
│       └── route.ts            # GET - 콜백
└── instagram/
    ├── route.ts                # GET - OAuth 시작
    └── callback/
        └── route.ts            # GET - 콜백
```

---

## 관련 파일

```
lib/encryption.ts       # 토큰 암호화/복호화
lib/youtube.ts          # YouTube API 함수
lib/instagram.ts        # Instagram API 함수
prisma/schema.prisma    # Connection 모델
```

---

## 환경변수

```env
# YouTube
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Instagram
META_APP_ID=1234567890
META_APP_SECRET=abcdef...
```

---

## YouTube OAuth

### 시작 (route.ts)

```typescript
// app/api/oauth/youtube/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/oauth/youtube/callback`
)

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
]

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: session.user.id,
  })

  return NextResponse.redirect(authUrl)
}
```

### 콜백 (callback/route.ts)

```typescript
// app/api/oauth/youtube/callback/route.ts
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
```

---

## Instagram OAuth

### ⚠️ 주의사항

```
- 비즈니스/크리에이터 계정만 가능
- content_publish 권한은 Meta 앱 심사 필수
- Phase 6에서 개발 예정
```

### 시작 (route.ts)

```typescript
// app/api/oauth/instagram/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth/instagram/callback`,
    scope: "instagram_business_basic,instagram_business_content_publish",
    response_type: "code",
    state: session.user.id,
  })

  return NextResponse.redirect(`https://api.instagram.com/oauth/authorize?${params}`)
}
```

### 콜백 (callback/route.ts)

```typescript
// app/api/oauth/instagram/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  
  // 1. 단기 토큰 교환
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth/instagram/callback`,
      code: code!,
    }),
  })
  const tokenData = await tokenRes.json()

  // 2. 장기 토큰 변환 (60일)
  const longLivedRes = await fetch(
    `https://graph.instagram.com/access_token?` +
    `grant_type=ig_exchange_token&` +
    `client_secret=${process.env.META_APP_SECRET}&` +
    `access_token=${tokenData.access_token}`
  )
  const longLivedData = await longLivedRes.json()

  // 3. 유저 정보 & DB 저장
  // ... (YouTube 콜백과 유사)
}
```

---

## 암호화 함수

```typescript
// lib/encryption.ts
import CryptoJS from "crypto-js"

const SECRET = process.env.ENCRYPTION_KEY!

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

---

## 연결 해제 API

```typescript
// app/api/connections/route.ts
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const platform = request.nextUrl.searchParams.get("platform")

  await prisma.connection.delete({
    where: { userId_platform: { userId: session.user.id, platform: platform! } },
  })

  return NextResponse.json({ success: true })
}
```

---

## 에러 메시지

| 상황 | 메시지 |
|------|--------|
| 권한 거부 | "연결이 취소되었습니다." |
| 연결 안 됨 | "YouTube 연결이 필요합니다. 설정에서 연결해주세요." |
| 토큰 만료 | "연결이 만료되었습니다. 다시 연결해주세요." |
| 할당량 초과 | "API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요." |
