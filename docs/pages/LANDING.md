# 랜딩 페이지 디자인 명세

> 파일 위치: `src/app/page.tsx`
> 디자인 참고: 이 페이지는 우주/코스믹 테마의 다크 원페이지 랜딩입니다.
> 공통 스타일은 `docs/DESIGN_SYSTEM.md`를 참조하세요.

---

## 페이지 구조 (위→아래 순서)

```
┌─────────────────────────────────────┐
│            Header (로고)              │
│                                      │
│         HeroSection (헤딩)            │
│                                      │
│       UploadSection (업로드 영역)      │
│                                      │
│     PlatformSection (플랫폼 아이콘)    │
│                                      │
│      FeaturesSection (기능 카드 x3)    │
│                                      │
│         CTASection (버튼)             │
│                                      │
│            Footer (링크)              │
└─────────────────────────────────────┘

배경: page-bg 그라데이션 + FloatingOrbs (z-0)
콘텐츠: relative z-10 (orbs 위에 표시)
```

---

## 섹션별 상세

### 1. Header

```
위치: 페이지 최상단
파일: components/layout/Header.tsx

구성:
  - "REELSHORTS" 로고 텍스트 (중앙 정렬)

스타일:
  - 텍스트: text-2xl font-bold tracking-[0.3em] uppercase text-white
  - 패딩: py-8
  - 배경: 투명 (page-bg가 비침)
```

### 2. HeroSection

```
파일: components/sections/HeroSection.tsx

구성:
  - 메인 헤딩: "Upload Once, Share Everywhere"
  - 서브텍스트: "Instantly publish your videos to Reels & Shorts simultaneously"

스타일:
  - 컨테이너: text-center max-w-4xl mx-auto px-4
  - 메인 헤딩: text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white
  - 서브텍스트: text-base md:text-lg text-white/70 mt-4
  - 아래 여백: mb-12
```

### 3. UploadSection

```
파일: components/sections/UploadSection.tsx
"use client" 필수 (react-dropzone 사용)

구성:
  - 드래그앤드롭 영역 (dashed 테두리 직사각형)
  - 내부: 클라우드 아이콘 + 안내 텍스트

레이아웃:
  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
  ╎   ☁  Drag & Drop Your Video Here  ╎
  ╎       or Click to Upload           ╎
  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘

스타일:
  - 외부: max-w-xl mx-auto
  - 영역: border-2 border-dashed border-white/30 rounded-xl
          bg-white/5 backdrop-blur-sm
          px-12 py-10
          flex items-center gap-4
          cursor-pointer
          hover:border-white/50 transition-colors
  - 아이콘: Cloud (Lucide), w-10 h-10, text-white/50
  - 메인 텍스트: "Drag & Drop Your Video Here" — text-base text-white/80 font-medium
  - 서브 텍스트: "or Click to Upload" — text-sm text-white/50
  - 아래 여백: mb-10

상호작용:
  - 드래그 오버 시: border-white/60 + bg-white/10 변경
  - 파일 드롭/선택 후: 파일명 표시 또는 썸네일 미리보기
```

### 4. PlatformSection

```
파일: components/sections/PlatformSection.tsx

구성:
  - Instagram 아이콘 (원형, 인스타 그라데이션 배경)
  - 양방향 화살표
  - YouTube Shorts 아이콘 (원형, 빨간 배경)

레이아웃:
  [Instagram 🔵] ──↔── [YouTube 🔴]

스타일:
  - 컨테이너: flex items-center justify-center gap-4 mb-12
  - 각 아이콘 원: w-12 h-12 rounded-full flex items-center justify-center
    - Instagram: bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400
    - YouTube: bg-red-600
  - 아이콘 (내부): w-6 h-6 text-white
    - Instagram: SiInstagram (react-icons)
    - YouTube: SiYoutube (react-icons) 또는 커스텀 "You Shorts" 텍스트 아이콘
  - 화살표: text-white/40, ArrowLeftRight (Lucide) 또는 커스텀 SVG
```

### 5. FeaturesSection

```
파일: components/sections/FeaturesSection.tsx

구성: 3개의 GlassCard를 가로 배치

레이아웃:
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  🕐 icon  │  │  📊 icon  │  │  🛡 icon  │
  │           │  │           │  │           │
  │ Save Time.│  │  Reach    │  │ Easy &    │
  │ Automate  │  │  Wider    │  │ Secure    │
  │ your      │  │ Audiences │  │ Your      │
  │ workflow  │  │ Maximize  │  │ content   │
  │           │  │ your views│  │ you safe  │
  └──────────┘  └──────────┘  └──────────┘

카드 데이터:
  1. icon: Clock (Lucide), title: "Save Time.", desc: "Automate your workflow"
  2. icon: BarChart3 (Lucide), title: "Reach Wider Audiences", desc: "Maximize your views"
  3. icon: Shield (Lucide), title: "Easy & Secure", desc: "Your content you safe"

스타일:
  - 그리드: grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto px-4
  - 각 카드: GlassCard 컴포넌트 사용
    - bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl
    - p-6 text-center
  - 아이콘 컨테이너: mx-auto mb-4 bg-white/10 rounded-xl w-12 h-12
                     flex items-center justify-center
  - 아이콘: w-5 h-5 text-white
  - 제목: text-sm font-semibold text-white mt-3
  - 설명: text-xs text-white/60 mt-1
  - 아래 여백: mb-10
```

### 6. CTASection

```
파일: components/sections/CTASection.tsx

구성:
  - "GET STARTED FOR FREE" 버튼 (중앙 정렬)

스타일:
  - 컨테이너: text-center mb-10
  - 버튼: GradientButton 컴포넌트 사용
    bg-gradient-to-r from-accent-red to-accent-orange
    text-white text-sm font-bold uppercase tracking-wider
    px-8 py-3 rounded-full
    hover:brightness-110 hover:scale-105
    transition-all duration-200
    shadow-lg shadow-accent-red/25
```

### 7. Footer

```
파일: components/layout/Footer.tsx

구성:
  - 상단: 네비게이션 링크 (가로 나열, 중앙)
  - 하단: 소셜 미디어 아이콘 (우측 정렬)

레이아웃:
  ─────────────────────────────────────
  How It Works    Pricing    FAQ    Contact         [인스타][유튜브][트위터][페북][틱톡]

스타일:
  - 컨테이너: border-t border-white/10 pt-6 pb-8
              max-w-6xl mx-auto px-4
              flex flex-col md:flex-row items-center justify-between gap-4
  - 링크 그룹: flex gap-6
  - 각 링크: text-sm text-white/60 hover:text-white transition-colors cursor-pointer
  - 소셜 아이콘 그룹: flex gap-3
  - 각 소셜 아이콘: w-5 h-5 text-white/60 hover:text-white transition-colors

링크 목록: ["How It Works", "Pricing", "FAQ", "Contact"]
소셜 아이콘: [SiInstagram, SiYoutube, SiTwitter, SiFacebook, SiTiktok] (react-icons/si)
```

---

## page.tsx 조합 예시

```tsx
// src/app/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import UploadSection from "@/components/sections/UploadSection";
import PlatformSection from "@/components/sections/PlatformSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

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
  );
}
```
