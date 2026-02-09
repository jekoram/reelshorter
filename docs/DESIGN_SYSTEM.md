# ReelShorts 디자인 시스템 (HTML/CSS/JS)

> 이 파일은 styles.css에서 사용하는 컬러, 타이포, 공용 스타일을 정의합니다.
> 모든 스타일은 CSS 변수(Custom Properties)로 관리합니다.

---

## 0. 훈련 데이터 패턴 사용 금지 (Anti-Pattern)

> ⚠️ **이 섹션은 다른 모든 규칙보다 우선한다.**

금지되는 행동:

- "GitHub에서 이렇게 하니까..." → ❌ 따라하지 않는다
- "대부분의 웹사이트가 이렇게 하니까..." → ❌ 근거가 아니다
- "흔히 보는 형태"를 그대로 만드는 것 → ❌ 이 문서에 정의된 스타일만 따른다

**원칙:** 코드 생성 시 이 문서에 명시된 값과 패턴만 사용한다. 문서에 없는 스타일은 임의로 추가하지 않고, 필요하면 이 문서를 먼저 업데이트한다.

---

## 1. 필수 제약 (Constraints)

이 제약은 모든 페이지, 모든 컴포넌트에 적용된다.

### 1.1 Border Radius

- **기본값: 4px** (`--radius-xs`)
- 8px 이상은 아래 예외 상황만 허용:
  - 업로드 영역: `--radius-sm` (8px)
  - 글래스 카드: `--radius-sm` (8px)
  - 원형 요소 (플랫폼 아이콘, 아바타): `--radius-full`
  - 버튼 pill 형태: `--radius-full`

### 1.2 화면당 컴포넌트 수 (Miller's Law)

- 한 화면에 표시하는 **독립 컴포넌트는 최대 7개**
- 랜딩 페이지 기준: Header, Hero, Upload, Platforms, Features, CTA, Footer = 7개 (한계)
- 새 섹션 추가 시 기존 섹션과 합치거나 페이지를 분리한다

### 1.3 컨테이너 중첩 금지

- 불필요한 wrapper `<div>` 금지
- `<section>` 안에 `.container` 안에 `.wrapper` 같은 3중 중첩 하지 않는다
- 최대 2단계까지만: `<section>` → 내부 요소

### 1.4 단일 시각적 피드백

- hover 시 **배경색 하나만** 변경한다
- ❌ hover에 색상 + scale + shadow + border 동시 변경 금지
- 예외: CTA 버튼만 `brightness + scale` 2개 허용 (주목성 필요)

### 1.5 Shadow 사용 제한

- Shadow 허용 대상: **Modal, Dropdown, Toast만**
- 카드, 버튼, 입력 필드에는 shadow 사용 금지
- 예외: CTA 버튼의 `shadow-lg` (색상 glow 효과)

### 1.6 Header > Sidebar 위계

- Header는 항상 화면 최상단, 전체 너비 사용
- Sidebar가 필요한 경우 Header 아래에 배치
- Header 안에 Sidebar를 넣지 않는다

---

## 테마 개요

- 기본 모드: **Dark Only**
- 컨셉: 우주/코스믹 다크 테마 + 글래스모피즘
- 배경에 떠다니는 반투명 빛(orbs) 효과로 깊이감 표현

---

## CSS 변수 정의

```css
/* styles.css 최상단에 정의 */
:root {
  /* ── 배경 그라데이션 색상 ── */
  --bg-top:     #0a0a1a;
  --bg-mid:     #1a1040;
  --bg-bottom:  #2d1b4e;
  --bg-warm:    #4a2040;

  /* ── 포인트 컬러 ── */
  --accent-red:    #e94560;
  --accent-orange: #ff6b35;
  --accent-purple: #7b2ff7;   /* 예비: 뱃지, 호버 등 추후 사용 */

  /* ── 플랫폼 컬러 ── */
  /* 주의: gradient는 background-image로만 적용 가능 (background 단축에서 작동 안 함) */
  --color-instagram: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  --color-youtube:   #ff0000;

  /* ── 상태 컬러 ── */
  --color-success: #22c55e;
  --color-error:   #ef4444;
  --color-info:    #3b82f6;

  /* ── 글래스모피즘 ── */
  --glass-bg:     rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-blur:   12px;

  /* ── 텍스트 ── */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted:     rgba(255, 255, 255, 0.5);

  /* ── 간격 ── */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;      /* 예비: 대형 섹션 간격 등 추후 사용 */

  /* ── 모서리 (1.1 제약 참조) ── */
  --radius-xs: 4px;       /* 기본값: 대부분의 요소 */
  --radius-sm: 8px;       /* 예외: 카드, 업로드 영역 */
  --radius-full: 9999px;  /* 예외: 버튼 pill, 원형 아이콘 */

  /* ── 최대 너비 ── */
  --max-width: 960px;
}
```

---

## 페이지 배경

모든 페이지에 공통 적용:

```css
body {
  margin: 0;
  font-family: 'Pretendard Variable', -apple-system, sans-serif;
  color: var(--text-primary);
  background: linear-gradient(
    180deg,
    var(--bg-top) 0%,
    #121230 20%,
    var(--bg-mid) 40%,
    var(--bg-bottom) 65%,
    var(--bg-warm) 85%,
    #1a1030 100%
  );
  min-height: 100vh;
}
```

---

## 글래스모피즘 카드

프로젝트 전반에서 카드, 입력 영역, 모달에 사용:

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--space-lg);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.12);
}
```

---

## 타이포그래피

### 폰트 로드 (각 HTML <head>에 포함)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" />
```

### 스케일

```css
/* 로고 */
.logo {
  font-size: 1.5rem;       /* 24px */
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-primary);
}

/* 페이지 메인 헤딩 */
.heading-xl {
  font-size: 2.5rem;       /* 40px, 모바일 */
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text-primary);
}
@media (min-width: 768px) {
  .heading-xl { font-size: 3.5rem; }   /* 56px, 데스크톱 */
}

/* 서브텍스트 */
.subtitle {
  font-size: 1.125rem;     /* 18px */
  color: var(--text-secondary);
}

/* 카드 제목 */
.card-title {
  font-size: 0.875rem;     /* 14px */
  font-weight: 600;
  color: var(--text-primary);
}

/* 카드 설명 */
.card-desc {
  font-size: 0.75rem;      /* 12px */
  color: var(--text-muted);
}
```

---

## 버튼

### Primary (CTA)

```css
.btn-primary {
  display: inline-block;
  background: linear-gradient(90deg, var(--accent-red), var(--accent-orange));
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 32px;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(233, 69, 96, 0.25);  /* 1.5 예외: CTA glow */
  transition: filter 0.2s, transform 0.2s;
}
.btn-primary:hover {
  filter: brightness(1.1);
  transform: scale(1.05);  /* 1.4 예외: CTA만 brightness + scale 허용 */
}
```

### Secondary (Ghost)

```css
.btn-secondary {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## 업로드 영역

```css
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-area:hover,
.upload-area.dragover {
  background: rgba(255, 255, 255, 0.1);  /* 단일 피드백: 배경색만 변경 (1.4 제약) */
}
```

---

## 아이콘

외부 라이브러리 없이 SVG 인라인 또는 emoji 사용:

| 용도 | 방법 |
|------|------|
| 기능 카드 아이콘 | SVG 인라인 (복붙) 또는 emoji |
| 소셜 아이콘 (푸터) | SVG 인라인 |
| 플랫폼 아이콘 (YouTube, Instagram) | SVG 인라인 (공식 로고) |
| 간단한 UI 아이콘 (화살표, 체크 등) | HTML 엔티티 또는 emoji |

아이콘 컨테이너 스타일:
```css
.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
}
.icon-box svg {
  width: 24px;
  height: 24px;
  fill: white;
}
```

---

## 떠다니는 빛 효과 (Floating Orbs)

CSS 애니메이션으로 구현 (JS 불필요):

```css
.floating-orbs {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.08), transparent);
  filter: blur(60px);
  animation: float 10s ease-in-out infinite;
}

/* 각 orb마다 크기, 위치, 속도를 다르게 */
.orb:nth-child(1) { width: 200px; height: 200px; top: 10%; left: 15%; animation-duration: 12s; }
.orb:nth-child(2) { width: 300px; height: 300px; top: 50%; right: 10%; animation-duration: 15s; animation-delay: -3s; }
.orb:nth-child(3) { width: 150px; height: 150px; top: 70%; left: 40%; animation-duration: 9s; animation-delay: -6s; }
.orb:nth-child(4) { width: 250px; height: 250px; top: 20%; right: 30%; animation-duration: 11s; animation-delay: -2s; }
.orb:nth-child(5) { width: 180px; height: 180px; top: 85%; left: 70%; animation-duration: 14s; animation-delay: -5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
```

HTML (모든 페이지 body 시작 직후에 넣기):
```html
<div class="floating-orbs">
  <div class="orb"></div>
  <div class="orb"></div>
  <div class="orb"></div>
  <div class="orb"></div>
  <div class="orb"></div>
</div>
```

---

## 반응형 규칙

```css
/* 기본: 모바일 (< 768px) */
/* 데스크톱: 768px 이상 */

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

@media (min-width: 768px) {
  .container { padding: 0 var(--space-xl); }
}
```

| 요소 | 모바일 | 데스크톱 (768px+) |
|------|--------|-------------------|
| 메인 헤딩 | 2.5rem | 3.5rem |
| 기능 카드 | 세로 1열 | 가로 3열 |
| 업로드 영역 | 패딩 축소 | 패딩 40px |
| 푸터 | 세로 배치 | 가로 배치 |

---

## 페이지 전환 (공용 네비게이션 기준)

페이지 간 이동은 일반 `<a href>` 링크 사용:

```html
<!-- 로그인 전: index.html만 접근 -->
<!-- 로그인 후: dashboard.html, settings.html 접근 가능 -->
<nav>
  <a href="/dashboard.html">Dashboard</a>
  <a href="/settings.html">Settings</a>
  <button onclick="logout()">Logout</button>
</nav>
```

로그인 여부 체크는 app.js에서 페이지 로드 시 JWT 토큰 유무로 판단.

---

## 폼 입력 스타일

```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xs);  /* 기본값 4px (1.1 제약) */
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
}
.form-input::placeholder {
  color: var(--text-muted);
}

/* textarea도 동일 스타일 적용 */
textarea.form-input {
  resize: vertical;
  min-height: 80px;
}
```

---

## 프로그레스 바

```css
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-red), var(--accent-orange));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
  width: 0%;
}
```

HTML:
```html
<div class="progress-bar">
  <div class="progress-bar__fill" id="upload-progress" style="width: 0%"></div>
</div>
```

JS:
```js
function updateProgressBar(percent) {
  document.getElementById('upload-progress').style.width = `${percent}%`;
}
```

---

## 토스트 알림

```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: white;
  z-index: 1000;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s forwards;
}
.toast--success { background: var(--color-success); }
.toast--error   { background: var(--color-error); }
.toast--info    { background: var(--color-info); }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toast-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```
