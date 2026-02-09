# ReelShorts 개발 문서 인덱스

> 영상 하나를 업로드하면 YouTube Shorts + Instagram Reels에 동시 게시하는 웹서비스.
> 각 파일은 독립적으로 사용 가능합니다. 작업에 필요한 파일만 참조하세요.

---

## 문서 구조

```
docs/
├── README.md                  ← 지금 이 파일 (인덱스)
│
│  ── HTML/CSS/JS 버전 (현재 사용) ──
├── CONVENTIONS.md             ← 기술 스택, 폴더 구조, 네이밍, 코드 규칙
├── DESIGN_SYSTEM.md           ← CSS 변수, 타이포, 글래스모피즘, 반응형
├── FEATURES.md                ← 인증·OAuth·업로드·게시 기능 명세
└── pages/
    └── LANDING.md             ← index.html 섹션별 디자인 상세
│
│  ── Next.js 버전 (보관용) ──
├── CONVENTIONS_next.md
├── DESIGN_SYSTEM_next.md
├── FEATURES_next.md
├── README_next.md
└── pages/
    └── LANDING_next.md
```

---

## 언제 어떤 파일을 참조하나요?

| 작업 | 참조할 파일 |
|------|------------|
| 프로젝트 세팅 (FastAPI + 정적 파일 서빙) | `CONVENTIONS.md` |
| styles.css 작성 (CSS 변수, 공용 스타일) | `DESIGN_SYSTEM.md` |
| index.html 랜딩 페이지 구현 | `pages/LANDING.md` + `DESIGN_SYSTEM.md` |
| dashboard.html 구현 | `pages/DASHBOARD.md` (추후 추가) + `DESIGN_SYSTEM.md` |
| settings.html 구현 | `pages/SETTINGS.md` (추후 추가) + `DESIGN_SYSTEM.md` |
| app.js 기능 개발 (인증, 업로드, 게시) | `FEATURES.md` |
| 백엔드 API 개발 | `FEATURES.md` (API 엔드포인트 섹션) |

---

## 바이브코딩 사용 예시

```
예시 1: 랜딩 페이지 만들기
→ "docs/DESIGN_SYSTEM.md와 docs/pages/LANDING.md를 참조해서 index.html을 구현해줘"

예시 2: app.js 업로드 기능 개발
→ "docs/FEATURES.md를 참조해서 app.js에 업로드 기능을 구현해줘"

예시 3: 백엔드 OAuth 라우터 개발
→ "docs/FEATURES.md의 OAuth 섹션을 참조해서 backend/routers/oauth.py를 구현해줘"

예시 4: styles.css 기본 세팅
→ "docs/DESIGN_SYSTEM.md를 참조해서 styles.css를 작성해줘"
```
