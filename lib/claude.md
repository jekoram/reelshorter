# Lib Context - lib/claude.md

> 유틸리티 함수, API 호출, 암호화 작업 시 참조
> 이 파일은 `lib/claude.md`에 저장

---

## 이 폴더 구조

```
lib/
├── claude.md           ← 이 파일
├── prisma.ts           # Prisma 클라이언트 (싱글톤)
├── auth.ts             # NextAuth 설정
├── encryption.ts       # 토큰 암호화/복호화
├── youtube.ts          # YouTube API 함수
├── instagram.ts        # Instagram API 함수
├── validators.ts       # 파일 검증 함수
└── utils.ts            # 기타 유틸리티
```

---

## Prisma 클라이언트 (싱글톤)

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**왜 싱글톤?** Next.js 개발 모드에서 핫 리로드 시 매번 새 연결이 생기는 것 방지.

---

## 암호화/복호화

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

**사용처:** OAuth 토큰을 DB에 저장할 때 암호화, 사용할 때 복호화.

---

## 파일 검증

```typescript
// lib/validators.ts

export const FILE_CONSTRAINTS = {
  maxSize: 499 * 1024 * 1024,  // 499MB
  maxDuration: 180,             // 180초
  allowedTypes: ["video/mp4", "video/quicktime", "video/webm"],
  allowedExtensions: [".mp4", ".mov", ".webm"],
}

export interface ValidationError {
  type: "format" | "size" | "duration" | "corrupt" | "empty"
  message: string
  detail?: string
}

export interface ValidationResult {
  valid: boolean
  error?: ValidationError
}

// 파일 형식 검증
export function validateFileType(file: File): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: {
        type: "empty",
        message: "업로드할 파일을 선택해주세요.",
      },
    }
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(file.type)
  const isValidExt = FILE_CONSTRAINTS.allowedExtensions.includes(ext)

  if (!isValidType && !isValidExt) {
    return {
      valid: false,
      error: {
        type: "format",
        message: "지원하지 않는 파일 형식입니다. MP4, MOV, WebM 파일만 업로드할 수 있어요.",
      },
    }
  }

  return { valid: true }
}

// 파일 크기 검증
export function validateFileSize(file: File): ValidationResult {
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    const sizeMB = Math.round(file.size / 1024 / 1024)
    return {
      valid: false,
      error: {
        type: "size",
        message: "파일 크기가 너무 큽니다. 최대 499MB까지 업로드할 수 있어요.",
        detail: `현재: ${sizeMB}MB`,
      },
    }
  }

  return { valid: true }
}

// 영상 길이 검증 (브라우저용)
export function validateVideoDuration(duration: number): ValidationResult {
  if (duration > FILE_CONSTRAINTS.maxDuration) {
    return {
      valid: false,
      error: {
        type: "duration",
        message: "영상이 너무 깁니다. 최대 3분(180초)까지 업로드할 수 있어요.",
        detail: `현재: ${Math.round(duration)}초`,
      },
    }
  }

  return { valid: true }
}

// 전체 검증 (클라이언트)
export async function validateVideoFile(file: File): Promise<ValidationResult> {
  // 1. 파일 존재
  const typeResult = validateFileType(file)
  if (!typeResult.valid) return typeResult

  // 2. 크기
  const sizeResult = validateFileSize(file)
  if (!sizeResult.valid) return sizeResult

  // 3. 길이 (video 요소로 확인)
  try {
    const duration = await getVideoDuration(file)
    const durationResult = validateVideoDuration(duration)
    if (!durationResult.valid) return durationResult
  } catch {
    return {
      valid: false,
      error: {
        type: "corrupt",
        message: "파일을 읽을 수 없습니다. 영상 파일이 손상되었거나 올바른 형식이 아닐 수 있어요.",
      },
    }
  }

  return { valid: true }
}

// 영상 길이 가져오기 (브라우저)
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error("Failed to load video"))
    }

    video.src = URL.createObjectURL(file)
  })
}
```

---

## YouTube API 함수

```typescript
// lib/youtube.ts
import { google } from "googleapis"
import { Readable } from "stream"
import { prisma } from "./prisma"
import { encrypt, decrypt } from "./encryption"

// OAuth 클라이언트 생성
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
}

// 유저의 YouTube 클라이언트 가져오기 (토큰 갱신 포함)
export async function getYouTubeClient(userId: string) {
  const connection = await prisma.connection.findUnique({
    where: { userId_platform: { userId, platform: "youtube" } },
  })

  if (!connection || !connection.isActive) {
    throw new Error("YouTube 연결이 필요합니다.")
  }

  const oauth2Client = createOAuth2Client()
  const accessToken = decrypt(connection.encryptedAccessToken)
  const refreshToken = connection.encryptedRefreshToken
    ? decrypt(connection.encryptedRefreshToken)
    : undefined

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  // 토큰 만료 확인 & 갱신
  const isExpired = connection.tokenExpiresAt && new Date() > connection.tokenExpiresAt

  if (isExpired && refreshToken) {
    const { credentials } = await oauth2Client.refreshAccessToken()

    await prisma.connection.update({
      where: { id: connection.id },
      data: {
        encryptedAccessToken: encrypt(credentials.access_token!),
        tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    })

    oauth2Client.setCredentials(credentials)
  }

  return google.youtube({ version: "v3", auth: oauth2Client })
}

// 영상 업로드
export interface UploadOptions {
  title: string
  description: string
  file: Buffer
  mimeType: string
}

export async function uploadToYouTube(userId: string, options: UploadOptions) {
  const youtube = await getYouTubeClient(userId)

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: options.title,
        description: options.description,
        categoryId: "22",  // People & Blogs
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType: options.mimeType,
      body: Readable.from(options.file),
    },
  })

  return {
    videoId: response.data.id,
    url: `https://youtube.com/shorts/${response.data.id}`,
  }
}
```

---

## 기타 유틸리티

```typescript
// lib/utils.ts

// 날짜 포맷
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// 날짜+시간 포맷
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// 파일 크기 포맷
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// 영상 길이 포맷
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// 클래스 병합 (조건부 클래스용)
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

// 랜덤 ID 생성
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// 딜레이 (async용)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

## import 패턴

```typescript
// @ alias 사용 (tsconfig.json에 설정됨)
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"
import { validateVideoFile } from "@/lib/validators"
import { uploadToYouTube } from "@/lib/youtube"
import { formatDate, cn } from "@/lib/utils"
```
