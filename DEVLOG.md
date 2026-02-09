# ReelShorts - 개발 로그

AI 코딩 도구와 함께 진행한 개발 작업 기록입니다.

---

## 2026-02-09 (Day 1)

### 1. [추정] 프로젝트 기획 및 구조 설계

```
영상 하나를 업로드하면 YouTube Shorts + Instagram Reels에 동시 게시하는 웹서비스를 만들고 싶어.
기술 스택은 HTML/CSS/JS 프론트엔드 + FastAPI 백엔드로 해줘.
```

**Claude Code 작업:**
- 프로젝트명 "ReelShorts" 확정
- 기술 스택 선정: HTML/CSS/Vanilla JS (프론트엔드) + FastAPI (백엔드) + SQLite (DB)
- 6단계 개발 로드맵 설계:
  - Phase 1: 기반 (DB, 인증, 로그인)
  - Phase 2: OAuth 연동 (YouTube/Instagram)
  - Phase 3: YouTube 업로드
  - Phase 4: 로그 시스템
  - Phase 5: Instagram 추가
  - Phase 6: 안정화 (테스트, 에러 처리)
- `project-structure-v3.md` — 전체 프로젝트 구조, DB 스키마, OAuth 흐름 설계 문서 작성

---

### 2. [추정] v2 → v3 아키텍처 전환 (API 키 → OAuth 방식)

```
API 키 직접 입력 대신 OAuth 방식으로 바꿔줘. 유저가 버튼만 클릭하면 되게.
```

**Claude Code 작업:**
- 기존 API 키 직접 입력 방식을 제거하고 OAuth 2.0 방식으로 전환
- `token_manager` → `oauth_manager`로 모듈명 변경
- `api_key` 모델 → `connection` 모델로 변경 (access_token + refresh_token 저장)
- OAuth 흐름 상세 설계 (인증 코드 → 토큰 교환 → 암호화 저장 → 자동 갱신)
- 사용자 연동 가이드 작성 (YouTube: 구글 로그인 → 허용, Instagram: Facebook 로그인 → 허용)

---

### 3. [추정] 프로젝트 폴더 구조 및 파일 생성

```
설계한 구조대로 프로젝트 폴더와 파일들을 전부 만들어줘.
```

**Claude Code 작업:**
- 프론트엔드 파일 생성:
  - `frontend/index.html` — 랜딩/로그인 페이지
  - `frontend/dashboard.html` — 영상 업로드 화면
  - `frontend/settings.html` — 플랫폼 연결 관리
  - `frontend/styles.css` — 전체 스타일
  - `frontend/app.js` — 전체 로직
- 백엔드 파일 생성:
  - `backend/main.py` — FastAPI 앱 시작점
  - `backend/routers/` — auth.py, oauth.py, publish.py, logs.py
  - `backend/services/` — auth_service.py, oauth_service.py, youtube_service.py, instagram_service.py, publish_service.py
  - `backend/security/` — encryption.py, oauth_manager.py, jwt_handler.py, password.py
  - `backend/models/` — user.py, connection.py, publish_log.py
  - `backend/utils/` — validators.py, exceptions.py
- 기타 파일:
  - `requirements.txt` — Python 패키지 목록
  - `.env.example` — 환경변수 템플릿
  - `.gitignore` — Git 제외 파일 설정
  - `tests/` — test_auth.py, test_oauth.py, test_publish.py, test_encryption.py

---

### 4. [추정] 설계 문서 체계 구축

```
각 기능별 상세 명세 문서를 만들어줘. 바이브코딩할 때 참조할 수 있게.
```

**Claude Code 작업:**
- `docs/README.md` — 문서 인덱스 (어떤 작업에 어떤 문서를 참조할지 가이드)
- `docs/CONVENTIONS.md` — 기술 스택, 폴더 구조, 네이밍 규칙, 코드 구조 정의
- `docs/DESIGN_SYSTEM.md` — CSS 변수, 다크 테마, 글래스모피즘, 반응형, 컴포넌트 스타일 정의
- `docs/FEATURES.md` — 인증/OAuth/업로드/게시 기능 명세 (프론트↔백엔드 연동 코드 포함)
- `docs/pages/LANDING.md` — 랜딩 페이지 섹션별 HTML/CSS 상세 설계
- 바이브코딩 사용 예시 포함 (각 문서를 참조하는 프롬프트 예시)

---

### 5. [추정] 디자인 시스템 설계 (우주/코스믹 다크 테마)

```
다크 테마로 해줘. 글래스모피즘 느낌에 우주 컨셉으로.
```

**Claude Code 작업:**
- Dark Only 모드, 우주/코스믹 테마 컨셉 확정
- CSS 변수 체계 설계:
  - 배경: 4단계 그라데이션 (`#0a0a1a` → `#1a1040` → `#2d1b4e` → `#4a2040`)
  - 포인트 컬러: 레드(`#e94560`), 오렌지(`#ff6b35`), 퍼플(`#7b2ff7`)
  - 글래스모피즘: 반투명 배경 + blur 효과
- 제약 규칙 설정:
  - Border Radius 기본 4px (Miller's Law 기반 컴포넌트 제한)
  - 컨테이너 중첩 최대 2단계
  - hover 시 단일 피드백 원칙
  - Shadow는 Modal/Dropdown/Toast만 허용
- 떠다니는 빛(Floating Orbs) CSS 애니메이션 설계
- Pretendard Variable 폰트 적용

---

### 6. write-post 스킬 설치

```
curl -fsSL https://raw.githubusercontent.com/daht-mad/ai-post-write/main/install.sh | bash
 이거 설치하고 싶은데 왜 안될까
```

**Claude Code 작업:**
- `curl` 명령 실행 시 404 에러 발생 원인 진단
- GPTers 게시글에서 원본 설치 명령 확인
- GitHub 저장소 이름 변경 발견: `ai-post-write` → `write-post`
- 설치 스크립트 파일명 변경 발견: `install.sh` → `install_mac.sh`
- 파이프 실행 시 `/dev/tty` 에러로 인해 수동 설치 진행
- `~/.claude/skills/write-post/SKILL.md` 파일 다운로드 및 설치 완료

---

### 7. DEVLOG 생성 (현재 작업)

```
/write-post
```

**Claude Code 작업:**
- 5개 AI 도구 세션 경로 스캔 (Claude Code만 2개 세션 발견)
- 세션 파싱 및 프로젝트 코드/문서 분석으로 개발 과정 역추정
- DEVLOG.md 생성

---

## 커밋 히스토리

| 날짜 | 커밋 | 설명 |
|------|------|------|
| — | — | Git 저장소 미초기화 (커밋 없음) |

---

## 기술 스택

- **Frontend**: HTML + CSS + Vanilla JS (프레임워크 없음, 단일 app.js)
- **Backend**: FastAPI (Python) — API + 정적 파일 서빙 겸용
- **DB**: SQLite + SQLAlchemy (MVP 단계)
- **인증**: JWT (python-jose) + bcrypt
- **암호화**: Fernet (cryptography) — OAuth 토큰 암호화
- **OAuth**: Google OAuth 2.0 (YouTube), Meta OAuth (Instagram)
- **Font**: Pretendard Variable (CDN)

---

## 주요 기능

1. **회원 인증**
   - 이메일/비밀번호 회원가입 및 로그인
   - JWT 기반 세션 관리
   - 자동 토큰 검증 및 만료 처리

2. **OAuth 플랫폼 연동**
   - YouTube: Google OAuth 2.0으로 원클릭 연결
   - Instagram: Meta OAuth로 비즈니스/크리에이터 계정 연결
   - 토큰 Fernet 암호화 저장 + 자동 갱신

3. **영상 동시 게시**
   - 드래그앤드롭 업로드 (Vanilla JS, 라이브러리 없음)
   - 파일 검증: 비율(9:16), 길이(60초), 형식(MP4/MOV), 크기(500MB)
   - YouTube Shorts + Instagram Reels 동시 게시
   - 플랫폼별 독립 진행률 표시

4. **게시 이력 관리**
   - 업로드/게시 이력 조회
   - 플랫폼별 성공/실패 상태 추적

---

## 현재 상태

- **설계 문서**: 완료 (CONVENTIONS, DESIGN_SYSTEM, FEATURES, LANDING 등)
- **프로젝트 구조**: 완료 (전체 폴더 및 파일 생성)
- **코드 구현**: 미착수 (모든 소스 파일이 플레이스홀더 상태)
- **다음 단계**: Phase 1 기반 구현 (DB 세팅, 비밀번호 해싱, JWT, 인증 API, 로그인 화면)
