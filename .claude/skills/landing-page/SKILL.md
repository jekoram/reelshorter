---
name: "ReelShorts 랜딩 페이지"
description: "ReelShorts 랜딩 페이지(app/page.tsx)의 섹션별 React 컴포넌트 구조와 Tailwind 스타일. 랜딩 페이지 구현, 섹션 추가/변경 시 반드시 이 스킬을 따른다. 트리거: 랜딩 페이지, page.tsx, 히어로 섹션, 업로드 영역, 기능 카드, CTA 버튼, 푸터"
---

## 페이지 구성

7개 섹션: Header → Hero → Upload → Platforms → Features → CTA → Footer.
배경: `page-bg` 그라데이션 + FloatingOrbs (z-0). 콘텐츠: `relative z-10`.

## 상세 규칙

`docs/pages/LANDING.md` 파일을 읽고 따른다. 디자인 스타일은 `docs/DESIGN_SYSTEM.md`도 함께 참조.

### 핵심 구조

```tsx
// app/page.tsx
export default function LandingPage() {
  return (
    <div className="page-bg relative overflow-hidden">
      <FloatingOrbs />
      <div className="relative z-10">
        <Header />
        <main className="flex flex-col items-center">
          <HeroSection />
          <UploadSection />
          <PlatformSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
```

### 주요 컴포넌트

- `Header`: 로고 텍스트, `tracking-[0.3em] uppercase`
- `HeroSection`: "Upload Once, Share Everywhere" 헤딩
- `UploadSection`: react-dropzone, dashed 테두리, `"use client"` 필수
- `PlatformSection`: Instagram ↔ YouTube 아이콘
- `FeaturesSection`: GlassCard x3 (Save Time, Reach Wider, Easy & Secure)
- `CTASection`: 그라데이션 CTA 버튼
- `Footer`: 네비게이션 링크 + 소셜 아이콘
