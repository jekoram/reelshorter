# Plan: 구글 소셜 로그인

> Team A | Priority: P2 | Status: Plan
> Created: 2026-02-25

---

## 1. 목표

기존 이메일/비밀번호 로그인에 추가로 Google OAuth 소셜 로그인을 지원하여 가입 허들을 낮춘다.

---

## 2. 현재 상태

- NextAuth.js + CredentialsProvider로 이메일/비밀번호 인증 구현됨
- PrismaAdapter 연결됨 (Account 모델 이미 존재)
- JWT 세션 전략 사용 중
- 로그인/회원가입 UI 완성 (글래스모피즘 스타일)
- GCP 프로젝트에 OAuth Client ID 이미 발급됨 (YouTube용)

---

## 3. 구현 범위

### 3.1 백엔드
| 항목 | 파일 | 내용 |
|------|------|------|
| GoogleProvider 추가 | `lib/auth.ts` | NextAuth providers에 GoogleProvider 추가 |
| 계정 연동 처리 | `lib/auth.ts` | signIn 콜백에서 기존 이메일 계정과 Google 계정 연동 |
| 환경변수 | `.env` | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (이미 존재) |

### 3.2 프론트엔드
| 항목 | 파일 | 내용 |
|------|------|------|
| 구글 로그인 버튼 | `components/auth/login-form.tsx` | "Google로 로그인" 버튼 추가 |
| 구글 회원가입 버튼 | `components/auth/signup-form.tsx` | "Google로 시작하기" 버튼 추가 |
| 구분선 | 양쪽 폼 | "또는" 구분선 UI |

### 3.3 계정 연동 로직
- 동일 이메일로 이미 가입한 유저가 Google 로그인 시 → 기존 계정에 연결
- Google로 최초 로그인 시 → 새 User 생성 (password: null)
- Google 유저가 나중에 비밀번호 설정 가능하도록 password nullable 유지 (이미 됨)

---

## 4. 수정 파일 목록

```
lib/auth.ts                     # GoogleProvider 추가 + signIn 콜백
components/auth/login-form.tsx  # Google 로그인 버튼
components/auth/signup-form.tsx # Google 가입 버튼
```

---

## 5. GCP 설정 (사전 조건)

YouTube OAuth에서 이미 GCP 프로젝트가 구성되어 있음. 추가 필요 사항:
- **승인된 리디렉션 URI 추가**: `{NEXTAUTH_URL}/api/auth/callback/google`
- 기존 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 그대로 사용

---

## 6. 주의사항

- PrismaAdapter + CredentialsProvider 조합에서 session strategy는 반드시 `"jwt"` 유지
- Google 로그인 시 `signIn` 콜백에서 allowDangerousEmailAccountLinking 또는 커스텀 연동 로직 필요
- YouTube OAuth(Connection 모델)와 Google 소셜 로그인(Account 모델)은 별개 흐름

---

## 7. 테스트 시나리오

1. 새 유저가 Google로 첫 로그인 → 회원 생성 + 대시보드 이동
2. 이메일로 가입한 유저가 같은 이메일의 Google로 로그인 → 기존 계정에 연결
3. Google로 가입한 유저가 비밀번호 없이 이메일 로그인 시도 → 적절한 에러 메시지
4. Google 로그인 취소 → 에러 없이 로그인 페이지 복귀
