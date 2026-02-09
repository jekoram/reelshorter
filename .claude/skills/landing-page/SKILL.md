---
name: "ReelShorts 랜딩 페이지"
description: "ReelShorts index.html 랜딩 페이지의 섹션별 HTML 구조와 CSS. 랜딩 페이지 구현, index.html 수정, 섹션 추가/변경 시 반드시 이 스킬을 따른다. 트리거: index.html, 랜딩 페이지, 히어로 섹션, 업로드 영역, 기능 카드, CTA 버튼, 푸터"
---

## 페이지 구성

7개 섹션: Header → Hero → Upload → Platforms → Features → CTA → Footer.
배경에 floating-orbs (CSS 애니메이션). 콘텐츠는 z-index: 1.

## 상세 규칙

`docs/pages/LANDING.md` 파일을 읽고 따른다. 디자인 스타일은 `docs/DESIGN_SYSTEM.md`도 함께 참조.

### 핵심 구조

```html
<body data-page="auth">
  <div class="floating-orbs"><!-- 5개 orb --></div>
  <div class="container">
    <header class="header">...</header>
    <section class="hero">...</section>
    <section class="upload">...</section>
    <section class="platforms">...</section>
    <section class="features">...</section>
    <section class="cta">...</section>
    <footer class="footer">...</footer>
  </div>
  <script src="app.js"></script>
</body>
```

### 전용 JS 함수

`scrollToUpload()` — CTA 클릭 시 업로드 영역으로 스크롤. 업로드 영역 클릭 시 파일 선택 다이얼로그.
