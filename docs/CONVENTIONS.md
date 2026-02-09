# ReelShorts 코드 컨벤션 (HTML/CSS/JS + FastAPI)

> 이 파일은 프로젝트 전반의 기술 스택, 폴더 구조, 코드 규칙을 정의합니다.

---

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| Frontend | HTML + CSS + Vanilla JS | 프레임워크 없음, 단일 app.js |
| Backend | FastAPI (Python) | API + 정적 파일 서빙 겸용 |
| DB | SQLite + SQLAlchemy | MVP 단계 |
| 인증 | JWT (python-jose) + bcrypt | 세션 관리 |
| 암호화 | Fernet (cryptography) | OAuth 토큰 암호화 |
| Font | Pretendard Variable | CDN 로드 |

---

## 프로젝트 구조

```
auto-shorts/
├── .env.example / .env / .gitignore
├── requirements.txt
│
├── frontend/                    ← FastAPI가 정적 파일로 서빙
│   ├── index.html               ← 랜딩 / 로그인
│   ├── dashboard.html           ← 영상 업로드 화면
│   ├── settings.html            ← 플랫폼 연결 관리
│   ├── styles.css               ← 전체 스타일 (1개 파일)
│   └── app.js                   ← 전체 로직 (1개 파일)
│
├── backend/
│   ├── main.py                  ← FastAPI 앱 시작점
│   ├── config.py                ← 환경변수
│   ├── database.py              ← DB 연결
│   ├── routers/                 ← API 엔드포인트
│   │   ├── auth.py
│   │   ├── oauth.py
│   │   ├── publish.py
│   │   └── logs.py
│   ├── services/                ← 비즈니스 로직
│   ├── security/                ← 보안 (암호화, JWT, OAuth)
│   ├── models/                  ← DB 모델
│   ├── utils/                   ← 유틸리티
│   └── logs/                    ← 시스템 로그
│
├── database/                    ← SQLite DB 파일
└── tests/
```

---

## FastAPI 정적 파일 서빙 설정

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# API 라우터 등록
app.include_router(auth_router, prefix="/api/auth")
app.include_router(oauth_router, prefix="/api/oauth")
app.include_router(publish_router, prefix="/api/publish")
app.include_router(logs_router, prefix="/api/logs")

# 프론트엔드 정적 파일 서빙 (맨 마지막에 등록)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
```

이렇게 하면:
- `http://localhost:8000/` → `frontend/index.html`
- `http://localhost:8000/dashboard.html` → `frontend/dashboard.html`
- `http://localhost:8000/api/auth/login` → FastAPI 라우터

---

## 프론트엔드 파일 역할

| 파일 | 역할 |
|------|------|
| `index.html` | 랜딩 페이지 + 로그인/회원가입 폼 |
| `dashboard.html` | 로그인 후 메인 화면, 영상 업로드 + 게시 |
| `settings.html` | YouTube/Instagram 연결 관리 |
| `styles.css` | 모든 페이지의 스타일 (1개 파일로 관리) |
| `app.js` | 모든 페이지의 로직 (1개 파일로 관리) |

---

## app.js 코드 구조

파일은 하나지만, 내부를 섹션으로 나눠서 관리:

```js
// ============================================
// 1. 공통 유틸리티
// ============================================
const API_BASE = '';  // 같은 서버이므로 빈 문자열

async function apiFetch(url, options = {}) {
  // 공통 fetch 래퍼 (에러 처리, 토큰 포함 등)
}

function showToast(message, type) {
  // 알림 메시지 표시
}

// ============================================
// 2. 인증 (index.html용)
// ============================================
function initAuthPage() { ... }

// ============================================
// 3. 대시보드 (dashboard.html용)
// ============================================
function initDashboardPage() { ... }

// ============================================
// 4. 설정 (settings.html용)
// ============================================
function initSettingsPage() { ... }

// ============================================
// 5. 페이지 초기화 (현재 페이지에 맞는 함수 실행)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'auth') initAuthPage();
  if (page === 'dashboard') initDashboardPage();
  if (page === 'settings') initSettingsPage();
});
```

각 HTML에서 `<body data-page="auth">` 같이 표시해두면 app.js가 알아서 해당 로직만 실행.

---

## CSS 코드 구조

styles.css도 섹션으로 나눠서 관리:

```css
/* ── 0. 변수 & 리셋 ── */
/* ── 1. 공통 레이아웃 ── */
/* ── 2. 공통 컴포넌트 (버튼, 카드, 토스트 등) ── */
/* ── 3. index.html (랜딩/인증) ── */
/* ── 4. dashboard.html (업로드) ── */
/* ── 5. settings.html (설정) ── */
/* ── 6. 반응형 ── */
```

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| CSS 클래스 | kebab-case | `upload-area`, `btn-primary`, `card-title` |
| JS 함수 | camelCase | `handleUpload()`, `initAuthPage()` |
| JS 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE` |
| HTML id | kebab-case | `upload-dropzone`, `login-form` |
| HTML data 속성 | kebab-case | `data-page`, `data-platform` |
| Python 함수/변수 | snake_case | `upload_video()`, `access_token` |
| Python 클래스 | PascalCase | `UserModel`, `OAuthService` |

---

## API 호출 규칙 (프론트엔드)

```js
// 모든 API 호출은 apiFetch 래퍼 사용
// - 자동으로 Content-Type 설정
// - 자동으로 JWT 토큰 헤더에 포함
// - 에러 시 토스트 알림 표시

// GET 예시
const status = await apiFetch('/api/oauth/status');

// POST 예시
const result = await apiFetch('/api/publish', {
  method: 'POST',
  body: formData
});
```

---

## 에러 처리

- 프론트엔드: `apiFetch` 래퍼에서 try-catch → `showToast()`로 사용자 알림
- 백엔드: `utils/exceptions.py`에서 커스텀 예외 정의 → FastAPI exception handler로 일관된 JSON 응답
