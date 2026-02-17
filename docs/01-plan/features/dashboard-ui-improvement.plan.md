# Dashboard UI Improvement Planning Document

> **Summary**: 대시보드 사이드바 폭 축소, 유저 정보 위치 이동, 설명 필드 플랫폼별 분리
>
> **Project**: Reelshorter
> **Version**: 0.1.0
> **Author**: AI Assistant
> **Date**: 2026-02-17
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

대시보드 UI를 개선하여 사용성을 높인다:
1. 사이드바 메뉴 폭을 줄여 콘텐츠 영역을 넓힘
2. 유저 정보/로그아웃을 우측 상단으로 이동하여 접근성 향상
3. 영상 설명을 YouTube/Instagram 별도로 입력할 수 있게 분리

### 1.2 Background

- 현재 사이드바(`w-64`, 256px)가 콘텐츠 영역 대비 넓음
- 유저 정보와 로그아웃이 좌측 하단에 위치해 접근성이 낮음
- YouTube Shorts와 Instagram Reels는 플랫폼 특성이 다르므로 설명을 별도로 작성할 필요가 있음

### 1.3 Related Documents

- PRD: `docs/reelshorter-prd.md` (섹션 4.2 대시보드 화면 구성)
- 디자인 시스템: `docs/DESIGN_SYSTEM.md`
- 컨벤션: `docs/CONVENTIONS.md`

---

## 2. Scope

### 2.1 In Scope

- [x] 사이드바 폭 ~10% 축소 (w-64 → w-56, 256px → 224px)
- [x] 유저 정보/로그아웃 버튼을 사이드바 하단에서 메인 영역 우측 상단으로 이동
- [x] 업로드 폼을 채널별 블록 구조로 재설계 (YouTube 블록 / Instagram 블록)
- [x] 각 블록에 업로드 여부 토글 + 제목 + 설명 배치
- [x] 업로드 여부 토글 활성화 시에만 제목/설명 입력 가능
- [x] API `/api/publish` 라우트에서 플랫폼별 제목/설명 수신 처리

### 2.2 Out of Scope

- 사이드바 반응형(모바일) 레이아웃 변경
- 업로드 폼의 다른 필드 변경 (제목, 파일 선택 등)
- 새로운 페이지 추가

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 사이드바 폭을 w-64(256px)에서 w-56(224px)으로 축소 | High | Pending |
| FR-02 | 사이드바 하단의 유저 이메일/로그아웃을 제거 | High | Pending |
| FR-03 | 대시보드 레이아웃 우측 상단에 유저 이메일 + 로그아웃 버튼 배치 | High | Pending |
| FR-04 | 업로드 폼을 채널별 블록(YouTube / Instagram)으로 재구성 | High | Pending |
| FR-05 | 각 블록에 업로드 여부 토글 + 제목 + 설명 필드 배치 | High | Pending |
| FR-06 | 토글 비활성 시 해당 블록의 제목/설명 입력 비활성화(disabled) | High | Pending |
| FR-07 | API에서 플랫폼별 제목/설명을 각각 수신 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| UI 일관성 | 기존 Tailwind 디자인 시스템과 일관된 스타일 유지 | 시각적 검토 |
| 반응형 | 기존 반응형 동작 유지 (lg 브레이크포인트) | 브라우저 리사이즈 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 사이드바 폭이 시각적으로 축소됨
- [ ] 유저 정보가 우측 상단에 표시됨
- [ ] 로그아웃 버튼이 우측 상단에서 작동함
- [ ] YouTube / Instagram 설명 필드가 시각적으로 분리됨
- [ ] 각 플랫폼 설명이 API로 별도 전달됨
- [ ] 빌드 성공, TypeScript 에러 없음

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 기존 기능 (파일 업로드, 플랫폼 선택) 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 사이드바 축소로 메뉴 텍스트 잘림 | Low | Low | w-56(224px)이면 텍스트 여유 충분 |
| API 변경으로 기존 업로드 기능 영향 | Medium | Low | description 필드 하위 호환 유지 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Dynamic** | Feature-based modules, services layer | ✅ |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | Next.js 14 (App Router) | 기존 프로젝트 |
| Styling | Tailwind CSS | 기존 프로젝트 |

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `docs/CONVENTIONS.md` exists
- [x] `docs/DESIGN_SYSTEM.md` exists
- [x] TypeScript configuration (`tsconfig.json`)

---

## 8. Affected Files

| File | Change Type | Description |
|------|-------------|-------------|
| `components/layout/sidebar.tsx` | Modify | 폭 축소, 유저 섹션 제거 |
| `app/dashboard/layout.tsx` | Modify | 우측 상단에 유저 정보/로그아웃 추가 |
| `components/dashboard/upload-form.tsx` | Modify | 설명 필드 플랫폼별 분리 |
| `app/api/publish/route.ts` | Modify | 플랫폼별 설명 수신 처리 |
| `docs/reelshorter-prd.md` | Modify | 대시보드 화면 구성도 업데이트 |

---

## 9. Next Steps

1. [ ] PRD 대시보드 화면 구성도 업데이트
2. [ ] Design 문서 작성 (`dashboard-ui-improvement.design.md`)
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-17 | Initial draft | AI Assistant |
