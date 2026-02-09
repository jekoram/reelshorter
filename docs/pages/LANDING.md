# 랜딩 페이지 디자인 명세 (index.html)

> 파일 위치: `frontend/index.html`
> 공통 스타일은 `docs/DESIGN_SYSTEM.md`를 참조하세요.

---

## 페이지 구조 (위→아래 순서)

```
┌─────────────────────────────────────┐
│         .floating-orbs (배경)        │  ← z-index: 0
├─────────────────────────────────────┤
│  .container (z-index: 1)            │
│                                      │
│   header.header                      │  ← "REELSHORTS" 로고
│                                      │
│   section.hero                       │  ← 메인 헤딩 + 서브텍스트
│                                      │
│   section.upload                     │  ← 드래그앤드롭 영역
│                                      │
│   section.platforms                  │  ← Instagram ↔ YouTube 아이콘
│                                      │
│   section.features                   │  ← 기능 카드 x3
│                                      │
│   section.cta                        │  ← GET STARTED FOR FREE 버튼
│                                      │
│   footer.footer                      │  ← 링크 + 소셜 아이콘
│                                      │
└─────────────────────────────────────┘
```

---

## HTML 뼈대

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReelShorts — Upload Once, Share Everywhere</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-page="auth">

  <!-- 배경 효과 -->
  <div class="floating-orbs">
    <div class="orb"></div>
    <div class="orb"></div>
    <div class="orb"></div>
    <div class="orb"></div>
    <div class="orb"></div>
  </div>

  <div class="container">
    <!-- 각 섹션 여기에 -->
  </div>

  <script src="app.js"></script>
</body>
</html>
```

---

## 섹션별 상세

### 1. Header

```html
<header class="header">
  <span class="logo">REELSHORTS</span>
</header>
```

```css
.header {
  text-align: center;
  padding: var(--space-xl) 0;
}
/* .logo 스타일은 DESIGN_SYSTEM.md 참조 */
```

### 2. Hero Section

```html
<section class="hero">
  <h1 class="heading-xl">Upload Once, Share Everywhere</h1>
  <p class="subtitle">Instantly publish your videos to Reels & Shorts simultaneously</p>
</section>
```

```css
.hero {
  text-align: center;
  margin-bottom: var(--space-xl);
}
.hero .subtitle {
  margin-top: var(--space-md);
}
```

### 3. Upload Section

```html
<section class="upload">
  <div class="upload-area" id="upload-dropzone">
    <svg><!-- 클라우드 아이콘 SVG --></svg>
    <div>
      <p class="upload-title">Drag & Drop Your Video Here</p>
      <p class="upload-sub">or Click to Upload</p>
    </div>
    <input type="file" id="file-input" accept="video/mp4,video/quicktime" hidden />
  </div>
</section>
```

```css
.upload {
  max-width: 560px;
  margin: 0 auto var(--space-xl);
}
/*
  .upload-area 기본 스타일(border, background 등)은 DESIGN_SYSTEM.md 참조.
  아래는 랜딩 페이지 전용 레이아웃 보강.
*/
.upload-area {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.upload-area .upload-title {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}
.upload-area .upload-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}
.upload-area svg {
  width: 40px;
  height: 40px;
  fill: none;
  stroke: var(--text-muted);
  stroke-width: 1.5;
  flex-shrink: 0;
}
```

### 4. Platform Section

```html
<section class="platforms">
  <div class="platform-icon platform-icon--instagram">
    <!-- Instagram SVG 로고 -->
  </div>
  <span class="platforms__arrow">⇄</span>
  <div class="platform-icon platform-icon--youtube">
    <!-- YouTube SVG 로고 -->
  </div>
</section>
```

```css
.platforms {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.platform-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.platform-icon svg {
  width: 24px;
  height: 24px;
  fill: white;
}
.platform-icon--instagram {
  background-image: var(--color-instagram);  /* gradient는 background-image로만 적용 */
}
.platform-icon--youtube {
  background: var(--color-youtube);
}

.platforms__arrow {
  color: var(--text-muted);
  font-size: 1.5rem;
}
```

### 5. Features Section

```html
<section class="features">
  <div class="glass-card feature-card">
    <div class="icon-box">
      <svg><!-- Clock SVG --></svg>
    </div>
    <h3 class="card-title">Save Time.</h3>
    <p class="card-desc">Automate your workflow</p>
  </div>

  <div class="glass-card feature-card">
    <div class="icon-box">
      <svg><!-- Chart SVG --></svg>
    </div>
    <h3 class="card-title">Reach Wider Audiences</h3>
    <p class="card-desc">Maximize your views</p>
  </div>

  <div class="glass-card feature-card">
    <div class="icon-box">
      <svg><!-- Shield SVG --></svg>
    </div>
    <h3 class="card-title">Easy & Secure</h3>
    <p class="card-desc">Your content stays safe</p>
  </div>
</section>
```

```css
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  max-width: 720px;
  margin: 0 auto var(--space-xl);
}
@media (min-width: 768px) {
  .features { grid-template-columns: repeat(3, 1fr); }
}

.feature-card {
  text-align: center;
}
.feature-card .icon-box {
  margin: 0 auto var(--space-md);
}
.feature-card .card-title {
  margin: var(--space-sm) 0 var(--space-xs);
}
.feature-card .card-desc {
  margin: 0;
}
```

### 6. CTA Section

```html
<section class="cta">
  <button type="button" class="btn-primary" onclick="scrollToUpload()">GET STARTED FOR FREE</button>
</section>
```

```css
.cta {
  text-align: center;
  margin-bottom: var(--space-xl);
}
```

### 7. Footer

```html
<footer class="footer">
  <nav class="footer__links">
    <a href="#how-it-works">How It Works</a>
    <a href="#pricing">Pricing</a>
    <a href="#faq">FAQ</a>
    <a href="#contact">Contact</a>
  </nav>
  <div class="footer__social">
    <a href="#"><!-- Instagram SVG --></a>
    <a href="#"><!-- YouTube SVG --></a>
    <a href="#"><!-- Twitter SVG --></a>
    <a href="#"><!-- Facebook SVG --></a>
    <a href="#"><!-- TikTok SVG --></a>
  </div>
</footer>
```

```css
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-lg) 0 var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}
@media (min-width: 768px) {
  .footer {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer__links {
  display: flex;
  gap: var(--space-lg);
}
.footer__links a {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.footer__links a:hover {
  color: var(--text-primary);
}

.footer__social {
  display: flex;
  gap: var(--space-sm);
}
.footer__social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}
.footer__social svg {
  width: 20px;
  height: 20px;
  fill: var(--text-muted);
  transition: fill 0.2s;
}
.footer__social a:hover svg {
  fill: var(--text-primary);
}
```

---

## 랜딩 페이지 전용 JS 함수

app.js의 `initAuthPage()` 안에 포함:

```js
// CTA 버튼 → 업로드 영역으로 스크롤
function scrollToUpload() {
  document.getElementById('upload-dropzone').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

// 업로드 영역 클릭 → 파일 선택 다이얼로그
document.getElementById('upload-dropzone').addEventListener('click', () => {
  document.getElementById('file-input').click();
});
```
