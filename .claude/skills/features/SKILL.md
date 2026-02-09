---
name: "ReelShorts 기능 명세"
description: "ReelShorts 서비스의 인증, OAuth, 업로드, 게시 기능 구현 규칙. 로그인/회원가입, YouTube/Instagram OAuth 연동, 영상 업로드, 동시 게시, 에러 처리 구현 시 반드시 이 스킬을 따른다. 트리거: 로그인, 회원가입, OAuth, YouTube 연결, Instagram 연결, 영상 업로드, 게시, API 엔드포인트, JWT, 토큰"
---

## 서비스 개요

영상 업로드 → YouTube Shorts + Instagram Reels 동시 게시.

## 상세 규칙

`docs/FEATURES.md` 파일을 읽고 따른다. 핵심 요약:

### 인증

- JWT를 `localStorage`에 저장
- `apiFetch()` 래퍼가 자동으로 `Authorization` 헤더 포함
- 401 응답 시 자동 로그아웃 + 리다이렉트

### OAuth 플로우

프론트에서 `/api/oauth/{platform}` 호출 → 서버가 인증 URL 반환 → 브라우저 리다이렉트 → 콜백에서 토큰 교환 → 암호화 저장. Access Token은 프론트엔드에 노출하지 않음.

### 업로드 검증 (클라이언트)

9:16 비율, 60초 이하, MP4/MOV, 500MB 이하. 드래그앤드롭 + 클릭 모두 지원. Progress Bar 필수.

### API 엔드포인트

인증: `/api/auth/*`, OAuth: `/api/oauth/*`, 게시: `/api/publish/*`, 이력: `/api/logs`
