---
name: "ReelShorts 코드 컨벤션"
description: "ReelShorts 프로젝트의 기술 스택, 폴더 구조, 네이밍, 코드 작성 규칙. 새 파일 생성, 폴더 구조 변경, 컴포넌트 추가, 함수/변수 네이밍 시 반드시 이 스킬을 따른다. 트리거: 파일 생성, 프로젝트 구조, 네이밍, Next.js 설정, Tailwind 설정, import 순서"
---

## 기술 스택

Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS 3
Icons: Lucide-react, react-icons/si (SNS)
State: Zustand (글로벌), TanStack Query (서버)
Animation: Framer Motion
Upload: react-dropzone
Auth: NextAuth.js
DB: Prisma + SQLite (개발) → PostgreSQL (배포)

## 상세 규칙

`docs/CONVENTIONS.md` 파일을 읽고 따른다. 핵심 요약:

### 네이밍

- 컴포넌트 파일: `kebab-case.tsx` (예: `upload-form.tsx`)
- 컴포넌트 이름: `PascalCase` (예: `UploadForm`)
- 함수, 변수: `camelCase` (예: `handleUpload`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)
- 타입/인터페이스: `PascalCase` (예: `UploadState`)
- 커스텀 훅: `use` 접두사 (예: `useAuth`)

### 컴포넌트 구조

`"use client"` 지시문은 클라이언트 상호작용 필요 시에만. Props는 interface로 정의. 200줄 이하 유지.

### Import 순서

1. React/Next.js → 2. 외부 라이브러리 → 3. 내부 모듈 (@/ alias) → 4. 타입

### Tailwind 클래스 순서

레이아웃 → 크기 → 여백 → 배경/색상 → 테두리 → 텍스트 → 기타
