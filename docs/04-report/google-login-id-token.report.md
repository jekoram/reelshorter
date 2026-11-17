# Report: Google 로그인 콜백 실패 수정 (id_token)

## 결과
- Google 로그인 → `/dashboard` 진입 확인 (2026-11-17, reelshorter.vercel.app)

## 원인
- Prisma `Account` 모델에 `id_token` 컬럼이 없어 Google 계정 연결 시 `prisma.account.create()` 실패 (`adapter_error_linkAccount`)
- NextAuth가 `/login?error=Callback`으로 되돌려 "화면이 안 바뀌는" 증상으로 보였음
- GCP OAuth 설정, Vercel 결제와는 무관 (reelshort.vercel.app는 별도로 402 상태인 구 도메인)

## 조치
- `Account`에 `id_token String? @db.Text`, `session_state String?` 추가
- `prisma db push`로 Neon에 반영, main push로 재배포 (c4c9cae)

## Check
- 설계 대비 구현 일치 (스키마 2필드, nullable, 기존 데이터 영향 없음)
- 재배포 직후 1회 `Can't reach database server` 발생 → Neon 콜드 스타트로 판단, 재시도 시 정상

## 후속 고려
- Neon 콜드 스타트 시 첫 로그인 실패 가능 → 연결 타임아웃(`connect_timeout`) 상향 검토
