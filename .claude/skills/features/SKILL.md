---
name: "ReelShorts 기능 명세"
description: "ReelShorts 서비스의 인증, OAuth, 업로드, 게시 기능 구현 규칙. 로그인/회원가입, YouTube/Instagram OAuth 연동, 영상 업로드, 동시 게시, 에러 처리 구현 시 반드시 이 스킬을 따른다. 트리거: 로그인, 회원가입, OAuth, YouTube 연결, Instagram 연결, 영상 업로드, 게시, API 엔드포인트, NextAuth, 토큰"
---

## 서비스 개요

영상 업로드 → YouTube Shorts + Instagram Reels 동시 게시.

## 상세 규칙

`docs/FEATURES.md` 파일을 읽고 따른다. 핵심 요약:

### 인증

- NextAuth.js (Credentials + Google OAuth)
- JWT 전략 (`session: { strategy: "jwt" }`)
- 보호 라우트: `middleware.ts`로 `/dashboard/*` 보호
- 세션 타입 확장: `types/next-auth.d.ts`

### OAuth 플로우

`/api/oauth/{platform}` → 플랫폼 인증 URL 리다이렉트 → 콜백에서 토큰 교환 → 암호화 후 DB 저장. Access Token은 프론트엔드에 노출하지 않음 (서버 사이드에서만 처리).

### 업로드 검증 (클라이언트)

9:16 비율 경고, 60초 이하, MP4/MOV, 500MB 이하. react-dropzone 사용. Progress Bar 필수.

### API 라우트

인증: `app/api/auth/[...nextauth]`, OAuth: `app/api/oauth/*`, 게시: `app/api/publish`, 연결: `app/api/connections`, 이력: `app/api/logs`

### Server Actions

`actions/auth.ts` (회원가입), `actions/publish.ts` (게시), `actions/connections.ts` (연결 관리)
