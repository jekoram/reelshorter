# Reelshorter 배포 가이드

> Vercel + Vercel Postgres 기준

---

## 사전 준비

- [x] GitHub 계정
- [x] Vercel 계정 (https://vercel.com - GitHub로 가입 가능)
- [x] GCP Console 접근 가능 (OAuth 설정용)

---

## 1단계: GitHub 리포지토리 준비

프로젝트를 GitHub에 push합니다.

```bash
git remote add origin https://github.com/YOUR_USERNAME/reelshorter.git
git push -u origin main
```

---

## 2단계: Vercel 프로젝트 생성

1. https://vercel.com/dashboard 접속
2. **"Add New Project"** 클릭
3. GitHub 리포지토리 **reelshorter** 선택
4. Framework Preset: **Next.js** (자동 감지됨)
5. **아직 Deploy 누르지 말 것** - 환경변수를 먼저 설정해야 합니다

---

## 3단계: Neon PostgreSQL (데이터베이스) 설정

1. Vercel Dashboard > 프로젝트 선택
2. **Storage** 탭 클릭
3. **Neon** 선택 (무료 tier 제공)
4. Neon 계정 연결 후 데이터베이스 생성
5. 리전: 서비스 대상 지역과 가까운 곳 선택
6. 생성 완료 후 프로젝트에 연결하면 `DATABASE_URL` 환경변수가 자동으로 추가됩니다

> Neon은 serverless PostgreSQL로 Vercel과 통합이 잘 되어 있으며, 무료 tier로 시작 가능합니다.

---

## 4단계: 환경변수 설정

Vercel Dashboard > 프로젝트 > **Settings** > **Environment Variables**

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `DATABASE_URL` | (3단계에서 자동 설정됨) | Vercel Postgres 연결 시 자동 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 결과 | 터미널에서 생성 |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Vercel이 부여한 도메인 |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` 결과 | 터미널에서 생성 |
| `GOOGLE_CLIENT_ID` | GCP OAuth Client ID | `xxx.apps.googleusercontent.com` 형식 |
| `GOOGLE_CLIENT_SECRET` | GCP OAuth Client Secret | `GOCSPX-xxx` 형식 |

### 시크릿 생성 방법

```bash
# NEXTAUTH_SECRET 생성
openssl rand -base64 32

# ENCRYPTION_KEY 생성
openssl rand -base64 32
```

### Google OAuth 자격 증명 확인

로컬의 `docs/google_client_secret*.json` 파일에서 값을 확인할 수 있습니다:

```json
{
  "web": {
    "client_id": "이 값을 GOOGLE_CLIENT_ID에",
    "client_secret": "이 값을 GOOGLE_CLIENT_SECRET에"
  }
}
```

---

## 5단계: GCP Console - Redirect URI 수정

YouTube OAuth가 작동하려면 GCP에 프로덕션 redirect URI를 등록해야 합니다.

1. https://console.cloud.google.com 접속
2. **APIs & Services** > **Credentials**
3. OAuth 2.0 Client ID 클릭 (기존에 만든 것)
4. **Authorized redirect URIs** 에 추가:

```
https://your-project.vercel.app/api/oauth/youtube/callback
```

5. 기존 `localhost:8000` → `localhost:3000`으로도 수정 (로컬 개발용):

```
http://localhost:3000/api/oauth/youtube/callback
```

6. **저장** 클릭

> 커스텀 도메인을 연결한 경우 해당 도메인의 URI도 추가하세요.

---

## 6단계: 배포

1. Vercel Dashboard에서 **"Deploy"** 클릭
2. 또는 `main` 브랜치에 push하면 자동 배포됩니다

```bash
git push origin main
```

### 빌드 과정 (자동)

```
npm install
  ↓ postinstall: prisma generate  (Prisma 클라이언트 생성)
npm run build
  ↓ next build                    (Next.js 빌드)
```

---

## 7단계: 데이터베이스 초기화

첫 배포 후 DB 테이블을 생성해야 합니다.

### 방법 A: Vercel CLI 사용

```bash
npm i -g vercel
vercel link
vercel env pull .env.local    # 프로덕션 환경변수 가져오기
npx prisma db push            # 테이블 생성
```

### 방법 B: Vercel Dashboard

1. 프로젝트 > **Settings** > **Functions**
2. 배포 후 사이트에 접속하면 Prisma가 자동으로 테이블 생성 시도

> 첫 배포에서 DB 에러가 발생하면 방법 A로 수동 생성하세요.

---

## 8단계: 배포 확인 체크리스트

- [ ] 사이트 접속 가능 (`https://your-project.vercel.app`)
- [ ] 랜딩 페이지 정상 표시
- [ ] 회원가입 → 로그인 정상 작동
- [ ] 대시보드 접근 가능
- [ ] YouTube 연결 버튼 → Google OAuth 로그인 페이지 이동
- [ ] OAuth 콜백 → 대시보드 연결 페이지로 복귀
- [ ] 연결 상태 표시 정상

---

## 커스텀 도메인 연결 (선택)

1. Vercel Dashboard > 프로젝트 > **Settings** > **Domains**
2. 도메인 추가 (예: `reelshorter.com`)
3. DNS 설정: CNAME → `cname.vercel-dns.com`
4. **NEXTAUTH_URL** 환경변수를 커스텀 도메인으로 변경
5. **GCP Console**에 커스텀 도메인 redirect URI 추가
6. 재배포

---

## 로컬 개발 환경 (PostgreSQL 전환 후)

Prisma를 PostgreSQL로 변경했으므로, 로컬에서도 PostgreSQL이 필요합니다.

### 방법 A: Vercel Postgres 공유 (권장)

```bash
vercel link
vercel env pull .env.local
npm run dev
```

### 방법 B: Docker로 로컬 PostgreSQL

```bash
docker run --name reelshorter-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=reelshorter \
  -p 5432:5432 \
  -d postgres:16

# .env에 설정
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reelshorter"

# 테이블 생성
npx prisma db push
```

---

## 트러블슈팅

### 빌드 실패: Prisma client not generated

```
postinstall 스크립트가 실행되지 않는 경우:
Vercel Dashboard > Settings > General > Build Command를
"prisma generate && next build" 로 변경
```

### OAuth 에러: redirect_uri_mismatch

```
GCP Console의 Authorized redirect URIs에
정확한 URL이 등록되어 있는지 확인:
https://your-project.vercel.app/api/oauth/youtube/callback
```

### DB 연결 에러

```
Vercel Dashboard > Storage에서 Database가 프로젝트에 연결되어 있는지 확인
DATABASE_URL 환경변수가 올바른지 확인
```
