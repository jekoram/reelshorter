# Plan: 업로드 결과 URL 표시

> **Feature**: upload-result-url
> **Status**: Plan
> **Created**: 2026-02-24
> **Author**: AI Assistant

---

## 1. 배경

현재 영상 업로드 성공 시 "영상이 성공적으로 업로드되었습니다!" 라는 텍스트만 표시되고, 업로드된 영상의 URL은 보여주지 않는다. API 응답에 URL이 포함되어 있지만 프론트엔드에서 무시하고 있다.

---

## 2. 목표

- 업로드 성공 시 알림 메시지에 업로드된 영상 URL을 표시
- 게시 이력 페이지에서 URL을 더 눈에 띄게 표시

---

## 3. 현황 분석

### API 응답 (이미 URL 포함)
```json
{
  "success": true,
  "results": [
    { "platform": "youtube", "success": true, "url": "https://youtube.com/shorts/xxx" }
  ],
  "message": "모든 플랫폼에 게시되었습니다!"
}
```

### 프론트엔드 (URL 무시)
```typescript
// upload-form.tsx - 성공 시
setSuccessMessage("영상이 성공적으로 업로드되었습니다!")
// → API 응답의 results를 파싱하지 않음
```

### 이력 페이지 (아이콘만 표시)
- ExternalLink 아이콘으로만 링크 제공 → 텍스트 없이 아이콘만 있어 눈에 잘 띄지 않음

---

## 4. 요구사항

### FR-01: 업로드 성공 알림에 URL 표시
- API 응답의 `results` 배열을 파싱
- 성공한 플랫폼별 URL을 링크로 표시
- 클릭 시 새 탭에서 열림

### FR-02: 이력 테이블 링크 개선
- 아이콘만 있던 링크 컬럼에 "보기" 텍스트 추가
- 링크가 더 눈에 띄도록 스타일 개선

---

## 5. 영향 범위

| 파일 | 변경 내용 |
|------|-----------|
| `components/dashboard/upload-form.tsx` | 성공 알림에 URL 링크 추가 |
| `components/dashboard/history-table.tsx` | 링크 컬럼 텍스트 추가 |

---

## 6. 리스크

- 없음 (UI 변경만, 기존 로직 변경 없음)
