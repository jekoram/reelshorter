# Design: 업로드 결과 URL 표시

> **Feature**: upload-result-url
> **Plan**: [upload-result-url.plan.md](../../01-plan/features/upload-result-url.plan.md)
> **Status**: Design
> **Created**: 2026-02-24

---

## 1. 컴포넌트 변경

### 1.1 upload-form.tsx

#### 상태 추가
```typescript
const [uploadedUrls, setUploadedUrls] = useState<{ platform: string; url: string }[]>([])
```

#### handleSubmit 성공 경로 수정
```typescript
const data = await response.json()

// URL 수집
const urls = data.results
  ?.filter((r: { success: boolean; url?: string }) => r.success && r.url)
  .map((r: { platform: string; url: string }) => ({ platform: r.platform, url: r.url })) || []

setUploadedUrls(urls)
setSuccessMessage(data.message || "영상이 성공적으로 업로드되었습니다!")
```

#### 초기화 시 URL도 리셋
```typescript
setUploadedUrls([])  // handleSubmit 시작 시, onDrop 시
```

#### 성공 알림 UI
```
┌─────────────────────────────────────────────┐
│ ✅ 모든 플랫폼에 게시되었습니다!              │
│                                             │
│  YouTube  https://youtube.com/shorts/xxx ↗  │
│  Instagram  https://instagram.com/xxx ↗     │
└─────────────────────────────────────────────┘
```

- 배경: `bg-green-50`
- 메시지: `text-green-600 text-sm`
- 플랫폼 라벨: `text-green-700 font-medium text-sm`
- URL 링크: `text-green-600 hover:text-green-800 underline text-sm`
- 링크에 `ExternalLink` 아이콘 (w-3 h-3)
- `target="_blank" rel="noopener noreferrer"`

### 1.2 history-table.tsx

#### 링크 컬럼 변경 (기존 → 변경)

**기존:**
```tsx
<ExternalLink className="w-4 h-4" />
```

**변경:**
```tsx
<span className="flex items-center gap-1">
  보기
  <ExternalLink className="w-3 h-3" />
</span>
```

- 텍스트 + 아이콘 조합
- 기존 `text-blue-600 hover:text-blue-700` 유지

---

## 2. 구현 순서

1. `upload-form.tsx` - 상태 추가 + API 응답 파싱 + 성공 알림 UI
2. `history-table.tsx` - 링크 컬럼 텍스트 추가

---

## 3. 변경 없는 파일

- `app/api/publish/route.ts` - 이미 URL 반환 중 (변경 불필요)
- `types/index.ts` - 기존 타입으로 충분
- `app/dashboard/history/page.tsx` - 이미 platformUrl 전달 중
