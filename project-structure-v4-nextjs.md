# 🎬 Auto Shorts Uploader v4 — Next.js 프로젝트 구조

## 기술 스택 요약

```
프론트엔드:  Next.js 14 + React + TypeScript + Tailwind CSS
백엔드:      Next.js API Routes + Server Actions
인증:        NextAuth.js (Auth.js)
데이터베이스: Prisma + SQLite(개발) → PostgreSQL(배포)
배포:        Vercel
```

---

## 전체 폴더 트리

```
auto-shorts/
│
├── .env.local                    ← 환경변수 (Git에 안 올림)
├── .env.example                  ← 환경변수 템플릿
├── .gitignore
├── package.json                  ← 프로젝트 정보 + 라이브러리 목록
├── tsconfig.json                 ← TypeScript 설정
├── tailwind.config.ts            ← Tailwind 설정
├── next.config.js                ← Next.js 설정
├── middleware.ts                 ← 로그인 체크 (모든 요청 전 실행)
│
├── prisma/
│   ├── schema.prisma             ← DB 테이블 구조 정의
│   └── dev.db                    ← SQLite 파일 (개발용)
│
├── app/                          ← 🌟 메인 폴더 (페이지 + API)
│   │
│   ├── layout.tsx                ← 전체 레이아웃 (공통 헤더 등)
│   ├── page.tsx                  ← / (랜딩 페이지)
│   ├── globals.css               ← 전역 스타일
│   │
│   ├── (auth)/                   ← 로그인 관련 페이지 그룹
│   │   ├── login/
│   │   │   └── page.tsx          ← /login
│   │   └── signup/
│   │       └── page.tsx          ← /signup
│   │
│   ├── dashboard/                ← 로그인 후 메인
│   │   ├── layout.tsx            ← 대시보드 공통 레이아웃 (사이드바 등)
│   │   ├── page.tsx              ← /dashboard (영상 업로드 화면)
│   │   │
│   │   ├── connections/
│   │   │   └── page.tsx          ← /dashboard/connections (플랫폼 연결)
│   │   │
│   │   ├── history/
│   │   │   └── page.tsx          ← /dashboard/history (업로드 이력)
│   │   │
│   │   └── settings/
│   │       └── page.tsx          ← /dashboard/settings (계정 설정)
│   │
│   └── api/                      ← 🌟 백엔드 API
│       │
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      ← NextAuth 설정 (로그인/OAuth)
│       │
│       ├── oauth/
│       │   ├── youtube/
│       │   │   ├── route.ts      ← GET /api/oauth/youtube (인증 시작)
│       │   │   └── callback/
│       │   │       └── route.ts  ← GET /api/oauth/youtube/callback
│       │   │
│       │   └── instagram/
│       │       ├── route.ts      ← GET /api/oauth/instagram
│       │       └── callback/
│       │           └── route.ts  ← GET /api/oauth/instagram/callback
│       │
│       ├── publish/
│       │   └── route.ts          ← POST /api/publish (영상 업로드)
│       │
│       ├── connections/
│       │   └── route.ts          ← GET, DELETE /api/connections
│       │
│       └── logs/
│           └── route.ts          ← GET /api/logs (업로드 이력)
│
├── components/                   ← 재사용 UI 컴포넌트
│   ├── ui/                       ← 기본 UI (버튼, 인풋, 카드 등)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── loading.tsx
│   │
│   ├── layout/                   ← 레이아웃 관련
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   │
│   ├── auth/                     ← 인증 관련
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   │
│   ├── dashboard/                ← 대시보드 관련
│   │   ├── upload-form.tsx       ← 영상 업로드 폼
│   │   ├── platform-card.tsx     ← YouTube/Instagram 연결 카드
│   │   └── history-table.tsx     ← 업로드 이력 테이블
│   │
│   └── providers/                ← Context Providers
│       └── session-provider.tsx  ← NextAuth 세션 제공
│
├── lib/                          ← 유틸리티 함수들
│   ├── prisma.ts                 ← Prisma 클라이언트 인스턴스
│   ├── auth.ts                   ← NextAuth 설정
│   ├── encryption.ts             ← 토큰 암호화/복호화 (Fernet 대신 crypto)
│   │
│   ├── youtube.ts                ← YouTube API 호출 함수들
│   ├── instagram.ts              ← Instagram API 호출 함수들
│   │
│   └── utils.ts                  ← 기타 유틸 (날짜 포맷 등)
│
├── types/                        ← TypeScript 타입 정의
│   ├── next-auth.d.ts            ← NextAuth 타입 확장
│   └── index.ts                  ← 공통 타입들
│
├── actions/                      ← Server Actions
│   ├── auth.ts                   ← 로그인/회원가입 액션
│   ├── publish.ts                ← 영상 게시 액션
│   └── connections.ts            ← 플랫폼 연결/해제 액션
│
└── public/                       ← 정적 파일 (이미지 등)
    ├── logo.svg
    └── favicon.ico
```

---

## 폴더별 역할 설명

### `/app` — 페이지 + API 라우트

```
Next.js 13+ 의 App Router 방식.
폴더 구조 = URL 구조

app/page.tsx              → /
app/login/page.tsx        → /login
app/dashboard/page.tsx    → /dashboard
app/api/publish/route.ts  → /api/publish (API)
```

### `/components` — 재사용 UI 블록

```
page.tsx에서 직접 UI 다 작성하면 복잡해짐.
컴포넌트로 쪼개서 조립.

예시:
  <UploadForm />    → 영상 업로드 폼 전체
  <PlatformCard />  → YouTube 연결 상태 카드
  <Button />        → 공통 버튼 스타일
```

### `/lib` — 비즈니스 로직

```
API 호출, 암호화, DB 연결 등 "로직"을 모아두는 곳.
컴포넌트나 API Route에서 불러다 씀.

예시:
  import { uploadToYouTube } from "@/lib/youtube"
  import { encrypt } from "@/lib/encryption"
```

### `/actions` — Server Actions

```
폼 제출 같은 걸 API Route 안 거치고 바로 서버에서 처리.
Next.js 13+의 새 기능.

예시:
  "use server"
  export async function publishVideo(formData: FormData) { ... }
```

### `/prisma` — 데이터베이스 정의

```
schema.prisma 파일에 테이블 구조 정의.
명령어 실행하면 DB에 자동 반영.

npx prisma db push    ← 스키마를 DB에 적용
npx prisma studio     ← DB 내용 웹에서 보기
```

---

## DB 구조 (Prisma 스키마)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"           // 배포 시 "postgresql"로 변경
  url      = env("DATABASE_URL")
}

// 유저 테이블
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?                          // OAuth만 쓰면 null
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]                        // OAuth 계정들
  connections   Connection[]                     // 플랫폼 연결
  publishLogs   PublishLog[]                     // 업로드 이력
}

// NextAuth용 OAuth 계정 (구글 로그인 등)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// 플랫폼 연결 (YouTube, Instagram)
model Connection {
  id                   String   @id @default(cuid())
  userId               String
  platform             String                       // "youtube" | "instagram"
  platformUserId       String?                      // 채널 ID 등
  platformUsername     String?                      // 표시용 이름
  encryptedAccessToken String
  encryptedRefreshToken String?
  tokenExpiresAt       DateTime?
  isActive             Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, platform])                     // 유저당 플랫폼 하나씩
}

// 업로드 이력
model PublishLog {
  id              String   @id @default(cuid())
  userId          String
  platform        String                           // "youtube" | "instagram"
  videoTitle      String
  status          String                           // "success" | "failed" | "pending"
  errorMessage    String?
  platformVideoId String?                          // 업로드 후 받는 ID
  platformUrl     String?                          // 업로드된 영상 URL
  publishedAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// NextAuth 세션 (선택사항 - JWT 쓰면 필요 없음)
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 환경변수 (.env.local)

```env
# 데이터베이스
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="32자이상랜덤문자열"
NEXTAUTH_URL="http://localhost:3000"

# 암호화 키 (토큰 암호화용)
ENCRYPTION_KEY="32자이상랜덤문자열"

# Google OAuth (YouTube)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Meta OAuth (Instagram) - 나중에 추가
# META_APP_ID="xxx"
# META_APP_SECRET="xxx"
```

---

## 개발 순서

```
Phase 1: 프로젝트 셋업 ─────────────────────
  ✅ Next.js 프로젝트 생성
  ✅ Tailwind, Prisma, NextAuth 설치
  ✅ 폴더 구조 생성
  ✅ DB 스키마 정의

Phase 2: 인증 ─────────────────────────────
  ✅ NextAuth 설정 (이메일/비번 or 구글 로그인)
  ✅ 회원가입/로그인 페이지
  ✅ 로그인 상태 체크 (middleware)
  ✅ 대시보드 레이아웃

Phase 3: YouTube OAuth ────────────────────
  ✅ lib/youtube.ts (OAuth URL 생성, 토큰 교환)
  ✅ lib/encryption.ts (토큰 암호화)
  ✅ API Routes (/api/oauth/youtube)
  ✅ 연결 화면 (PlatformCard 컴포넌트)

Phase 4: YouTube 업로드 ───────────────────
  ✅ lib/youtube.ts (업로드 함수 추가)
  ✅ 업로드 폼 (UploadForm 컴포넌트)
  ✅ API Route (/api/publish)
  ✅ 업로드 이력 저장 (PublishLog)

Phase 5: 이력 & 설정 ──────────────────────
  ✅ 업로드 이력 페이지
  ✅ 연결 해제 기능
  ✅ 계정 설정

Phase 6: Instagram 추가 ───────────────────
  ✅ lib/instagram.ts
  ✅ OAuth 연동
  ✅ 업로드 기능

Phase 7: 배포 ─────────────────────────────
  ✅ Vercel 연결
  ✅ PostgreSQL 전환 (Vercel Postgres 또는 Supabase)
  ✅ 환경변수 설정
```

---

## 프로젝트 생성 명령어

```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest auto-shorts

# 선택지:
#   TypeScript?         → Yes
#   ESLint?             → Yes
#   Tailwind CSS?       → Yes
#   `src/` directory?   → No
#   App Router?         → Yes
#   import alias?       → Yes (@/*)

# 2. 폴더 이동
cd auto-shorts

# 3. 추가 패키지 설치
npm install prisma @prisma/client          # DB
npm install next-auth @auth/prisma-adapter # 인증
npm install googleapis                      # YouTube API
npm install crypto-js                       # 암호화

# 4. Prisma 초기화
npx prisma init --datasource-provider sqlite

# 5. 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열기
```

---

## FastAPI 구조와 비교

```
FastAPI (Python)                 Next.js
─────────────────────────────────────────────────
backend/routers/auth.py     →   app/api/auth/[...nextauth]/route.ts
backend/routers/youtube.py  →   app/api/oauth/youtube/route.ts
backend/services/           →   lib/
backend/models/             →   prisma/schema.prisma
backend/security/           →   lib/encryption.ts + NextAuth
frontend/                   →   app/ + components/
```

---

## 핵심 차이점 요약

```
┌─ 예전 구조 (FastAPI + HTML) ────────────────────────────┐
│  프로젝트 2개 (frontend + backend)                       │
│  Python + JavaScript 둘 다 써야 함                       │
│  CORS 설정 필요 (프론트↔백 통신)                          │
│  배포도 2번 (프론트 따로, 백 따로)                         │
└──────────────────────────────────────────────────────────┘

┌─ 새 구조 (Next.js 풀스택) ───────────────────────────────┐
│  프로젝트 1개                                            │
│  TypeScript 하나로 통일                                   │
│  CORS 필요 없음 (같은 서버)                               │
│  배포 1번 (Vercel에 푸시만 하면 끝)                        │
└──────────────────────────────────────────────────────────┘
```
