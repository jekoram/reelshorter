# Plan: Google 로그인 콜백 실패 수정 (id_token)

## 문제
- 증상: 프로덕션(reelshorter.vercel.app)에서 "Google로 로그인" 후 `/login?error=Callback`으로 되돌아옴
- 로그: `[next-auth][error][adapter_error_linkAccount] Unknown argument 'id_token'`
- 원인: Google OAuth 응답에 `id_token`이 포함되는데, Prisma `Account` 모델에 해당 컬럼이 없어 `prisma.account.create()`가 실패

## 목표
- Google 로그인(신규 가입 / 기존 이메일 계정 연결) 정상 동작

## 범위
- `prisma/schema.prisma` Account 모델에 NextAuth 표준 OAuth 필드 추가 (`id_token`, `session_state`)
- 프로덕션 DB(Neon)에 nullable 컬럼 추가 (`prisma db push`)
- 재배포

## 범위 외
- GCP OAuth 설정 (확인 결과 redirect URI·client_id 정상)
- `reelshort.vercel.app` (구 도메인, 402 DEPLOYMENT_DISABLED) 정리
