---
name: "ReelShorts 코드 컨벤션"
description: "ReelShorts 프로젝트의 기술 스택, 폴더 구조, 네이밍, 코드 작성 규칙. 새 파일 생성, 폴더 구조 변경, FastAPI 라우터 추가, app.js 수정, 함수/변수 네이밍 시 반드시 이 스킬을 따른다. 트리거: 파일 생성, 프로젝트 구조, 네이밍, FastAPI 설정, 정적 파일 서빙, import 순서"
---

## 기술 스택

Frontend: HTML + CSS + Vanilla JS (프레임워크 없음)
Backend: FastAPI (Python) — API + 정적 파일 서빙 겸용
DB: SQLite + SQLAlchemy

## 상세 규칙

`docs/CONVENTIONS.md` 파일을 읽고 따른다. 핵심 요약:

### 네이밍

- CSS 클래스: `kebab-case` (예: `upload-area`)
- JS 함수: `camelCase` (예: `handleUpload`)
- JS 상수: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)
- Python: 함수 `snake_case`, 클래스 `PascalCase`

### app.js 구조

페이지별 `init` 함수로 분리: `initAuthPage()`, `initDashboardPage()`, `initSettingsPage()`. HTML의 `data-page` 속성으로 판별.

### API 호출

모든 API는 `apiFetch()` 래퍼 사용. `fetch()` 직접 호출 금지.

### FastAPI 서빙

API prefix: `/api/auth`, `/api/oauth`, `/api/publish`, `/api/logs`. 정적 파일은 맨 마지막에 마운트.
