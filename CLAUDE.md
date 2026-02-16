# CLAUDE.md

## Debugging / Troubleshooting

When diagnosing errors, start by checking foundational dependencies (runtime, package manager, OS-level tools) before investigating application-level config. Root causes are often missing prerequisites.

# Reelshorter - Claude Context (Root)

> 이 파일은 모든 작업에 공통으로 적용되는 코어 컨텍스트입니다.
> 특정 기능 작업 시 해당 폴더의 `claude.md`를 추가로 참조하세요.

---

## 프로젝트 한 줄 요약

**Reelshorter** = 영상 하나로 YouTube Shorts + Instagram Reels 동시 게시

---

## 기술 스택

```
Framework:    Next.js 14 (App Router)
Language:     TypeScript (strict)
Styling:      Tailwind CSS
Auth:         NextAuth.js v5
ORM:          Prisma
DB:           SQLite (dev) → PostgreSQL (prod)
Deploy:       Vercel
```

---

## 프로젝트 구조 (요약)

```
reelshorter/
├── app/                    # 페이지 + API Routes
│   ├── (auth)/             # 로그인/회원가입 → claude.md 있음
│   ├── dashboard/          # 로그인 후 영역
│   └── api/                # 백엔드 API
│       └── oauth/          # OAuth 관련 → claude.md 있음
├── components/             # 재사용 UI → claude.md 있음
├── lib/                    # 유틸리티 함수 → claude.md 있음
├── actions/                # Server Actions
├── types/                  # TypeScript 타입
└── prisma/                 # DB 스키마
```

---

## 코딩 규칙 (필수)

### 네이밍
```
파일:       kebab-case.tsx     (예: upload-form.tsx)
컴포넌트:   PascalCase         (예: UploadForm)
함수/변수:  camelCase          (예: handleSubmit)
상수:       UPPER_SNAKE_CASE   (예: MAX_FILE_SIZE)
```

### TypeScript
```typescript
// ✅ Good
interface User { ... }
type Platform = "youtube" | "instagram"
function handleError(error: unknown) { ... }

// ❌ Bad
interface IUser { ... }          // I 접두사 금지
function handleError(error: any) // any 금지
```

### 컴포넌트 기본 구조
```typescript
// 1. imports
// 2. types/interfaces
// 3. component function
//    - hooks 먼저
//    - handlers
//    - return JSX
```

### 에러 메시지
```
사용자용:  한국어, 친절하게
콘솔용:    영어, 기술적으로
```

---

## 환경변수

```env
# 필수
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ENCRYPTION_KEY=

# YouTube (Phase 3)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Instagram (Phase 6)
META_APP_ID=
META_APP_SECRET=
```

---

## DB 핵심 모델

```
User          유저 (email, password)
Connection    플랫폼 연결 (youtube/instagram 토큰)
PublishLog    업로드 이력
```

상세 스키마는 `prisma/schema.prisma` 참조

---

## 파일 업로드 규격

```
최대 크기:    499MB
최대 길이:    180초 (3분)
지원 포맷:    MP4, MOV, WebM
```

---

## 현재 진행 상태

- [ ] Phase 1: 프로젝트 셋업
- [ ] Phase 2: 인증
- [ ] Phase 3: YouTube OAuth
- [ ] Phase 4: 영상 업로드
- [ ] Phase 5: 이력/설정
- [ ] Phase 6: Instagram
- [ ] Phase 7: 배포

---

## 폴더별 컨텍스트 파일

작업하는 폴더에 `claude.md`가 있으면 **함께 참조**하세요:

| 폴더 | 내용 |
|------|------|
| `app/(auth)/claude.md` | 회원가입, 로그인, 세션 |
| `app/api/oauth/claude.md` | YouTube/Instagram OAuth |
| `components/claude.md` | UI 컴포넌트, Tailwind 패턴 |
| `lib/claude.md` | 유틸 함수, 암호화, API 호출 |

---

## 자주 쓰는 코드 패턴

### Prisma 클라이언트
```typescript
import { prisma } from "@/lib/prisma"
```

### 서버 인증 체크
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)
if (!session) redirect("/login")
```

### API Response
```typescript
return NextResponse.json({ data }, { status: 200 })
return NextResponse.json({ error: "message" }, { status: 400 })
```

---

## 참고 문서

- PRD: `docs/reelshorter-prd.md`
- GCP 설정: `docs/gcp-oauth-setup-guide.md`
- Instagram 설정: `docs/instagram-oauth-setup-guide.md`
