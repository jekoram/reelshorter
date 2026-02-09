# ReelShorts 디자인 시스템

> 이 파일은 프로젝트 전체에서 사용하는 컬러, 타이포그래피, 공용 스타일을 정의합니다.
> UI 컴포넌트를 만들 때 항상 이 파일을 참조하세요.

---

## 테마 개요

- 기본 모드: **Dark Only** (라이트 모드 없음)
- 컨셉: 우주/코스믹 다크 테마 + 글래스모피즘
- 배경에 떠다니는 반투명 빛(orbs) 효과로 깊이감 표현

---

## 컬러 팔레트

### Tailwind Config 확장

```js
// tailwind.config.ts → theme.extend.colors
colors: {
  // ── 배경 그라데이션 색상 ──
  'bg-top':    '#0a0a1a',   // 최상단: 진한 다크
  'bg-mid':    '#1a1040',   // 중간: 보라-남색
  'bg-bottom': '#2d1b4e',   // 하단: 보라
  'bg-warm':   '#4a2040',   // 하단: 따뜻한 보라-주황 톤

  // ── 포인트 컬러 ──
  'accent-red':    '#e94560',   // CTA 버튼 좌측, 주요 강조
  'accent-orange': '#ff6b35',   // CTA 버튼 우측 그라데이션
  'accent-purple': '#7b2ff7',   // 보조 포인트 (뱃지, 호버 등)

  // ── 글래스모피즘 ──
  'glass-bg':     'rgba(255, 255, 255, 0.08)',
  'glass-border': 'rgba(255, 255, 255, 0.15)',

  // ── 텍스트 ──
  'text-primary':   '#ffffff',
  'text-secondary': 'rgba(255, 255, 255, 0.7)',
  'text-muted':     'rgba(255, 255, 255, 0.5)',
}
```

### 사용 예시

| 용도 | 클래스 |
|------|--------|
| 메인 텍스트 | `text-white` |
| 보조 텍스트 | `text-white/70` |
| 비활성 텍스트 | `text-white/50` |
| CTA 버튼 배경 | `bg-gradient-to-r from-accent-red to-accent-orange` |
| 보조 버튼 배경 | `bg-white/10 hover:bg-white/20` |

---

## 페이지 배경 그라데이션

모든 페이지에 공통 적용되는 세로 방향 멀티 컬러 그라데이션:

```css
/* globals.css에 정의 */
.page-bg {
  background: linear-gradient(
    180deg,
    #0a0a1a 0%,       /* 진한 다크 */
    #121230 20%,       /* 남색 */
    #1a1040 40%,       /* 보라-남색 */
    #2d1b4e 65%,       /* 보라 */
    #4a2040 85%,       /* 따뜻한 보라 */
    #1a1030 100%       /* 다시 어두워짐 */
  );
  min-height: 100vh;
}
```

적용 위치: `src/app/layout.tsx`의 `<body>` 또는 최상위 `<div>`에 `page-bg` 클래스 적용.

---

## 글래스모피즘 (Glass Style)

프로젝트 전반에서 카드, 입력 영역, 모달 등에 사용하는 공용 스타일:

```
Tailwind 클래스 조합:
  bg-white/[0.08]
  backdrop-blur-md
  border border-white/[0.15]
  rounded-2xl
```

### GlassCard 컴포넌트 인터페이스

```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;       // 추가 스타일 오버라이드용
  hover?: boolean;          // true면 hover:bg-white/[0.12] 적용
}
```

---

## 타이포그래피

### 폰트

- 기본 폰트: **Pretendard Variable**
- 로고 전용: 세리프 계열 또는 `font-bold tracking-[0.3em]`으로 세리프 느낌 연출

### 스케일

| 용도 | Tailwind 클래스 |
|------|-----------------|
| 로고 | `text-2xl font-bold tracking-[0.3em] uppercase` |
| 페이지 메인 헤딩 | `text-5xl md:text-6xl font-bold tracking-tight text-white` |
| 섹션 서브텍스트 | `text-lg text-white/70` |
| 카드 제목 | `text-sm font-semibold text-white` |
| 카드 설명 | `text-xs text-white/60` |
| 버튼 텍스트 | `text-sm font-bold uppercase tracking-wider` |
| 푸터 링크 | `text-sm text-white/60 hover:text-white` |

---

## 떠다니는 빛 효과 (Floating Orbs)

페이지 배경에 떠다니는 반투명 원형 빛. 모든 페이지에 공통 적용.

### 구현 스펙

```
컴포넌트: FloatingOrbs.tsx (components/ui/)
위치: layout.tsx에서 page-bg 안에 absolute로 배치
z-index: 0 (콘텐츠보다 뒤)

각 Orb:
  - 태그: <motion.div>
  - position: absolute
  - 크기: w-[100px~300px] h-[100px~300px] (각각 다르게)
  - 배경: radial-gradient(circle, rgba(255,255,255,0.08), transparent)
  - 블러: blur-[60px]
  - 애니메이션: Framer Motion
    - y축 상하 이동: ±20~40px
    - duration: 8~15초
    - repeat: Infinity
    - ease: easeInOut
  - 개수: 5~8개
  - overflow: hidden (부모에 적용, 스크롤바 방지)
```

---

## 반응형 규칙

| 브레이크포인트 | 기준 | 변경사항 |
|---------------|------|---------|
| 기본 (mobile-first) | ~639px | 1열 레이아웃, 텍스트 축소 |
| `sm` | 640px+ | 약간의 여백 확대 |
| `md` | 768px+ | 데스크톱 레이아웃 전환 |
| `lg` | 1024px+ | max-width 제한, 좌우 여백 확대 |

### 주요 반응형 변경

- 메인 헤딩: `text-3xl` → `md:text-5xl` → `lg:text-6xl`
- 기능 카드: `grid-cols-1` → `md:grid-cols-3`
- 업로드 영역: 패딩 축소, 텍스트 크기 축소
- 컨테이너: `max-w-6xl mx-auto px-4 md:px-8`

---

## 공용 버튼 스타일

### Primary (CTA)

```
bg-gradient-to-r from-accent-red to-accent-orange
text-white font-bold uppercase tracking-wider
px-8 py-3 rounded-full
hover:brightness-110 hover:scale-105
transition-all duration-200
```

### Secondary (Ghost)

```
bg-white/10 hover:bg-white/20
text-white
px-6 py-2 rounded-full
border border-white/20
transition-all duration-200
```

---

## 아이콘 스타일

- 기능 카드 아이콘 컨테이너: `bg-white/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center`
- 아이콘 크기: `w-5 h-5` (Lucide 기본)
- 아이콘 색상: `text-white`
- 소셜 아이콘: `w-5 h-5 text-white/60 hover:text-white`
