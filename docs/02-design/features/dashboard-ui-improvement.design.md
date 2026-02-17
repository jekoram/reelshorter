# Dashboard UI Improvement Design Document

> **Summary**: 사이드바 축소, 유저 정보 이동, 업로드 폼 채널별 블록 구조 재설계
>
> **Project**: Reelshorter
> **Version**: 0.1.0
> **Author**: AI Assistant
> **Date**: 2026-02-17
> **Status**: Draft
> **Planning Doc**: [dashboard-ui-improvement.plan.md](../01-plan/features/dashboard-ui-improvement.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. 사이드바 폭 축소로 콘텐츠 영역 확대
2. 유저 정보/로그아웃을 우측 상단으로 이동하여 접근성 개선
3. 업로드 폼을 채널별 독립 블록으로 재구성하여 플랫폼별 맞춤 입력 지원

### 1.2 Design Principles

- 각 플랫폼 블록은 시각적으로 독립된 카드로 구분
- 비활성 상태의 블록은 disabled 스타일로 명확히 구분
- 기존 디자인 시스템(Tailwind, Card 컴포넌트) 재활용

---

## 2. UI/UX Design

### 2.1 대시보드 전체 레이아웃 (변경 후)

```
┌──────────┬──────────────────────────────────────────────────┐
│  LOGO    │                           user@email [로그아웃]  │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ 📤 Upload│  영상 업로드                                      │
│ 🔗 Conn. │  ┌──────────────────────────────────────────┐    │
│ 📋 Hist. │  │  📁 파일을 선택하거나 드래그               │    │
│ ⚙ Sett. │  └──────────────────────────────────────────┘    │
│          │                                                  │
│          │  ┌─ 🔴 YouTube Shorts ──────────────────────┐    │
│          │  │  [☑ 이 플랫폼에 업로드]                   │    │
│          │  │  제목: [______________________________]   │    │
│          │  │  설명: [______________________________]   │    │
│          │  │        [______________________________]   │    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                  │
│          │  ┌─ 📷 Instagram Reels ─────────────────────┐    │
│          │  │  [☐ 이 플랫폼에 업로드]                   │    │
│          │  │  제목: [_______(비활성)________________]   │    │
│          │  │  설명: [_______(비활성)________________]   │    │
│          │  │        [_______(비활성)________________]   │    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                  │
│          │           [🚀 업로드하기]                         │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 2.2 채널 블록 상태

| 상태 | 토글 | 제목/설명 | 스타일 |
|------|------|----------|--------|
| 비활성 (기본) | ☐ 체크 해제 | disabled, placeholder 회색 | opacity-50, 입력 불가 |
| 활성 | ☑ 체크 | 입력 가능 | 정상 스타일 |
| 플랫폼 미연결 | ☐ 체크 해제 + disabled | disabled | opacity-50, 토글도 비활성, "연결 필요" 표시 |

### 2.3 User Flow

```
파일 선택 → 채널 블록에서 업로드 토글 ON → 제목/설명 입력 → [업로드] 클릭
```

---

## 3. Component Design

### 3.1 변경 대상 컴포넌트

| Component | File | Change |
|-----------|------|--------|
| Sidebar | `components/layout/sidebar.tsx` | 폭 w-64→w-56, 유저 섹션 제거 |
| DashboardLayout | `app/dashboard/layout.tsx` | 우측 상단 유저 정보 + 로그아웃 추가 (클라이언트 컴포넌트 분리) |
| DashboardTopBar | `components/layout/dashboard-top-bar.tsx` | **신규** - 유저 이메일 + 로그아웃 버튼 |
| UploadForm | `components/dashboard/upload-form.tsx` | 채널별 블록 구조로 재구성 |
| PlatformBlock | `components/dashboard/platform-block.tsx` | **신규** - 채널별 토글 + 제목 + 설명 블록 |

### 3.2 PlatformBlock 컴포넌트 설계

```typescript
interface PlatformBlockProps {
  platform: "youtube" | "instagram"
  isConnected: boolean            // 플랫폼 OAuth 연결 여부
  enabled: boolean                // 업로드 토글 상태
  onToggle: (enabled: boolean) => void
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  disabled?: boolean              // 전체 폼 비활성 (업로드 중)
}
```

**렌더링 로직:**
- `isConnected === false` → 토글 disabled + "연결 필요" 안내
- `enabled === false` → 제목/설명 input disabled + opacity-50
- `enabled === true` → 제목/설명 input 활성

### 3.3 DashboardTopBar 컴포넌트 설계

```typescript
// "use client" - useSession, signOut 사용
interface DashboardTopBarProps {}

// 내부에서 useSession()으로 이메일 가져옴
// signOut({ callbackUrl: "/login" })으로 로그아웃
```

### 3.4 UploadForm 상태 변경

**기존:**
```typescript
const [title, setTitle] = useState("")
const [description, setDescription] = useState("")
const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())
```

**변경 후:**
```typescript
interface PlatformInput {
  enabled: boolean
  title: string
  description: string
}

const [youtube, setYoutube] = useState<PlatformInput>({
  enabled: false, title: "", description: ""
})
const [instagram, setInstagram] = useState<PlatformInput>({
  enabled: false, title: "", description: ""
})
```

---

## 4. API Specification

### 4.1 `POST /api/publish` 변경

**기존 Request:**
```
FormData:
  file: File
  title: string
  description: string
  platforms: string (JSON array)
```

**변경 후 Request:**
```
FormData:
  file: File
  platforms: string (JSON)
  // platforms 형식:
  // [
  //   { "platform": "youtube", "title": "...", "description": "..." },
  //   { "platform": "instagram", "title": "...", "description": "..." }
  // ]
```

**서버 측 처리:**
- `platforms` JSON을 파싱하여 각 플랫폼별 title/description 사용
- YouTube 업로드 시 해당 플랫폼의 title/description 전달
- Instagram 업로드 시 해당 플랫폼의 title/description 전달

---

## 5. Sidebar 변경

### 5.1 폭 축소

| 항목 | 기존 | 변경 |
|------|------|------|
| Tailwind 클래스 | `w-64` (256px) | `w-56` (224px) |
| 축소율 | - | ~12.5% |

### 5.2 유저 섹션 제거

사이드바 하단의 다음 요소 삭제:
- 유저 이메일 표시 (`session.user.email`)
- 로그아웃 버튼
- 구분선 (`border-t`)

---

## 6. Implementation Order

1. [ ] `components/layout/dashboard-top-bar.tsx` 신규 생성
2. [ ] `components/layout/sidebar.tsx` 수정 (폭 축소 + 유저 섹션 제거)
3. [ ] `app/dashboard/layout.tsx` 수정 (DashboardTopBar 추가)
4. [ ] `components/dashboard/platform-block.tsx` 신규 생성
5. [ ] `components/dashboard/upload-form.tsx` 수정 (채널별 블록 구조)
6. [ ] `app/api/publish/route.ts` 수정 (플랫폼별 title/description 수신)
7. [ ] 빌드 확인 및 브라우저 테스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-17 | Initial draft | AI Assistant |
