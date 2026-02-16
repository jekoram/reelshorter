# ReelShorts 코드 컨벤션

> 이 파일은 프로젝트 전반의 기술 스택, 폴더 구조, 네이밍 규칙을 정의합니다.
> 새 페이지나 기능을 만들 때 항상 이 파일을 참조하세요.

---

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| Framework | Next.js 14+ (App Router) | `src/app/` 디렉토리 사용 |
| Language | TypeScript | 모든 파일에 적용 |
| Styling | Tailwind CSS 3 | `globals.css`에 커스텀 유틸리티 정의 |
| Icons | Lucide-react, React Icons | SNS 아이콘은 `react-icons/si` 사용 |
| Global State | Zustand | 인증 상태, 업로드 상태 등 |
| Server State | TanStack Query (React Query) | API 호출 캐싱 |
| Animation | Framer Motion | 페이지 전환, 마이크로 인터랙션 |
| Upload | react-dropzone | 드래그앤드롭 영역 |
| Font | Pretendard Variable | CDN 또는 next/font 로컬 |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (폰트, 메타데이터, 배경)
│   ├── page.tsx                # 랜딩 페이지
│   ├── dashboard/
│   │   └── page.tsx            # 대시보드 (업로드 후 관리)
│   ├── auth/
│   │   └── callback/page.tsx   # OAuth 콜백 처리
│   └── globals.css             # Tailwind 지시문 + 커스텀 CSS
├── components/
│   ├── layout/                 # Header, Footer 등 공통 레이아웃
│   ├── sections/               # 페이지별 섹션 컴포넌트
│   └── ui/                     # 재사용 가능한 기본 UI 컴포넌트
├── hooks/                      # 커스텀 훅
├── lib/
│   ├── utils.ts                # cn() 헬퍼 등
│   ├── api.ts                  # API 클라이언트 설정
│   └── constants.ts            # 상수 정의
├── stores/                     # Zustand 스토어
│   ├── authStore.ts
│   └── uploadStore.ts
├── types/                      # 공용 타입 정의
│   └── index.ts
└── styles/
    └── fonts.ts                # 폰트 설정
```

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일/이름 | PascalCase | `HeroSection.tsx`, `GlassCard.tsx` |
| 함수, 변수 | camelCase | `handleUpload`, `isConnected` |
| 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `SUPPORTED_FORMATS` |
| 타입/인터페이스 | PascalCase + 접두사 없음 | `UploadState`, `UserProfile` |
| 커스텀 훅 | use 접두사 + camelCase | `useAuth`, `useUploadProgress` |
| Zustand 스토어 | use 접두사 + Store 접미사 | `useAuthStore`, `useUploadStore` |

---

## 코드 작성 규칙

### 컴포넌트

- `"use client"` 지시문: 클라이언트 상호작용(useState, onClick 등)이 필요한 컴포넌트에만 적용
- Props 타입은 컴포넌트 파일 상단에 `interface`로 정의
- 한 컴포넌트 파일은 200줄 이하 유지. 넘으면 분리

```tsx
// 컴포넌트 기본 구조
"use client";

import { useState } from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return ( ... );
}
```

### Tailwind 클래스 순서

레이아웃 → 크기 → 여백 → 배경/색상 → 테두리 → 텍스트 → 기타

```tsx
// Good
<div className="flex items-center w-full p-6 bg-white/10 border border-white/15 rounded-2xl text-white backdrop-blur-md">

// Bad (순서 없이 뒤섞임)
<div className="text-white rounded-2xl flex bg-white/10 p-6 w-full border">
```

### 에러 처리

- 모든 API 호출은 `try-catch`로 감싸기
- 사용자에게 보이는 에러 메시지 필수 (토스트 또는 인라인)
- 콘솔 에러 로깅 병행

### Import 순서

```tsx
// 1. React/Next.js
import { useState } from "react";
import Image from "next/image";

// 2. 외부 라이브러리
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

// 3. 내부 모듈 (컴포넌트, 훅, 유틸)
import GlassCard from "@/components/ui/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// 4. 타입
import type { UploadState } from "@/types";
```
