# Design: Google 로그인 콜백 실패 수정 (id_token)

## 스키마 변경
```prisma
model Account {
  ...
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  ...
}
```
- 두 필드 모두 nullable → 기존 행 영향 없음, 데이터 손실 없음
- `@auth/prisma-adapter` 표준 Account 스키마와 일치시킴

## DB 반영
- 마이그레이션 디렉터리가 없고 `db push` 방식 사용 중 → `npx prisma db push`
- 추가 전용(additive) 변경이므로 `--accept-data-loss` 불필요

## 배포
- 빌드 시 `prisma generate`로 클라이언트 재생성 → main 브랜치 push로 Vercel 재배포

## 검증
- Vercel 로그에 `adapter_error_linkAccount` 미발생
- Google 로그인 후 `/dashboard` 진입
