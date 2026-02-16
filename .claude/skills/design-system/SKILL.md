---
name: "ReelShorts 디자인 시스템"
description: "ReelShorts 프로젝트의 Tailwind CSS 스타일 작성 규칙. Tailwind 설정, globals.css 작성, 색상/타이포/버튼/카드 등 UI 요소 구현 시 반드시 이 스킬을 따른다. 트리거: Tailwind 설정, globals.css 수정, 색상 변경, 버튼 스타일, 글래스모피즘, 반응형, 레이아웃"
---

## 최우선 규칙

이 문서에 정의된 값과 패턴만 사용한다. 문서에 없는 스타일을 임의로 추가하지 않는다.

## 상세 규칙

`docs/DESIGN_SYSTEM.md` 파일을 읽고 따른다. 핵심 요약:

### 테마

- Dark Only (라이트 모드 없음)
- 우주/코스믹 다크 테마 + 글래스모피즘
- 배경: 세로 멀티 컬러 그라데이션 (`page-bg` 클래스)

### 컬러 팔레트 (tailwind.config.ts)

배경: `bg-top`(#0a0a1a), `bg-mid`(#1a1040), `bg-bottom`(#2d1b4e), `bg-warm`(#4a2040)
포인트: `accent-red`(#e94560), `accent-orange`(#ff6b35), `accent-purple`(#7b2ff7)
글래스: `glass-bg`(rgba 0.08), `glass-border`(rgba 0.15)
텍스트: `text-white`, `text-white/70`, `text-white/50`

### 글래스모피즘 패턴

`bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl`

### 공용 버튼

- Primary CTA: `bg-gradient-to-r from-accent-red to-accent-orange` + `rounded-full`
- Secondary Ghost: `bg-white/10 hover:bg-white/20` + `border border-white/20` + `rounded-full`

### 반응형

모바일 퍼스트. `sm`(640), `md`(768), `lg`(1024). 컨테이너: `max-w-6xl mx-auto px-4 md:px-8`
