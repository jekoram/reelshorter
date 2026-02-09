# ReelShorts 개발 문서 인덱스

> 영상 하나를 업로드하면 YouTube Shorts + Instagram Reels에 동시 게시하는 웹서비스.
> 각 파일은 독립적으로 사용 가능합니다. 작업에 필요한 파일만 참조하세요.

---

## 문서 구조

```
docs/
├── README.md              ← 지금 이 파일 (인덱스)
├── CONVENTIONS.md         ← 기술 스택, 폴더 구조, 네이밍, 코드 규칙
├── DESIGN_SYSTEM.md       ← 컬러, 타이포, 글래스모피즘, 반응형, 공용 스타일
├── FEATURES.md            ← 업로드·인증·게시 기능 명세, API 엔드포인트
└── pages/
    └── LANDING.md         ← 랜딩 페이지 섹션별 디자인 상세
```

---

## 언제 어떤 파일을 참조하나요?

| 작업 | 참조할 파일 |
|------|------------|
| 프로젝트 초기 세팅 (Next.js, Tailwind 설정) | `CONVENTIONS.md` |
| tailwind.config.ts 설정, globals.css 작성 | `DESIGN_SYSTEM.md` |
| 공용 UI 컴포넌트 (GlassCard, 버튼 등) 만들기 | `DESIGN_SYSTEM.md` |
| 랜딩 페이지 구현 | `pages/LANDING.md` + `DESIGN_SYSTEM.md` |
| 대시보드 페이지 구현 | `pages/DASHBOARD.md` (추후 추가) + `DESIGN_SYSTEM.md` |
| 업로드 기능 개발 | `FEATURES.md` |
| OAuth 인증 개발 | `FEATURES.md` |
| 백엔드 API 개발 | `FEATURES.md` (API 엔드포인트 섹션) |
| 새 페이지 추가 | `CONVENTIONS.md` (구조) + `DESIGN_SYSTEM.md` (스타일) |

---

## Claude Code 사용 팁

작업 시작 전에 필요한 문서만 컨텍스트로 전달하면 됩니다:

```
예시 1: 랜딩 페이지 만들기
→ "docs/DESIGN_SYSTEM.md와 docs/pages/LANDING.md를 참조해서 랜딩 페이지를 구현해줘"

예시 2: 업로드 기능 개발
→ "docs/FEATURES.md를 참조해서 영상 업로드 컴포넌트를 구현해줘"

예시 3: 새 페이지 추가
→ "docs/CONVENTIONS.md와 docs/DESIGN_SYSTEM.md를 참조해서 대시보드 페이지를 만들어줘"
```
