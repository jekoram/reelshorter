# Plan: 비밀번호 변경 및 찾기

> Team C | Priority: P2 | Status: Plan
> Created: 2026-02-25

---

## 1. 목표

로그인 상태에서 비밀번호 변경 + 비로그인 상태에서 이메일 기반 비밀번호 재설정(찾기) 기능을 구현한다.

---

## 2. 현재 상태

- 설정 페이지(`app/dashboard/settings/page.tsx`) 존재하나 비밀번호 변경 UI 없음
- 로그인 페이지에 "비밀번호 찾기" 링크 없음
- User 모델에 `password` 필드 존재 (nullable - Google 가입 유저)
- 비밀번호 리셋 토큰 저장용 모델 없음

---

## 3. 구현 범위

### 3.1 비밀번호 변경 (로그인 상태)
| 항목 | 파일 | 내용 |
|------|------|------|
| 변경 API | `app/api/user/password/route.ts` | 현재 비밀번호 확인 → 새 비밀번호 저장 |
| 변경 UI | `components/dashboard/password-change-form.tsx` | 현재/새/확인 비밀번호 입력 폼 |
| 설정 페이지 연동 | `app/dashboard/settings/page.tsx` | 비밀번호 변경 섹션 추가 |

### 3.2 비밀번호 찾기 (비로그인 상태)
| 항목 | 파일 | 내용 |
|------|------|------|
| DB 모델 추가 | `prisma/schema.prisma` | PasswordResetToken 모델 추가 |
| 리셋 요청 API | `app/api/auth/forgot-password/route.ts` | 이메일로 리셋 링크 발송 |
| 리셋 실행 API | `app/api/auth/reset-password/route.ts` | 토큰 검증 → 비밀번호 변경 |
| 이메일 발송 | `lib/email.ts` | 리셋 링크 이메일 발송 (Resend 또는 Nodemailer) |
| 비밀번호 찾기 페이지 | `app/(auth)/forgot-password/page.tsx` | 이메일 입력 폼 |
| 비밀번호 재설정 페이지 | `app/(auth)/reset-password/page.tsx` | 새 비밀번호 입력 폼 |
| 로그인 페이지 링크 | `components/auth/login-form.tsx` | "비밀번호를 잊으셨나요?" 링크 추가 |

---

## 4. DB 스키마 변경

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
}
```

- 토큰 유효기간: 1시간
- 한 이메일당 최근 1개만 유효 (새 요청 시 기존 삭제)

---

## 5. 비밀번호 찾기 흐름

```
1. 유저가 /forgot-password 에서 이메일 입력
2. 서버: 이메일 존재 확인 → 랜덤 토큰 생성 → DB 저장
3. 이메일 발송: /reset-password?token=xxx 링크
4. 유저가 링크 클릭 → /reset-password 페이지
5. 새 비밀번호 입력 → 서버: 토큰 검증 → 비밀번호 변경
6. 성공 → 로그인 페이지로 이동
```

---

## 6. 이메일 발송 솔루션

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Resend** (권장) | 무료 tier 100통/일, Next.js 친화적 | 가입 필요 |
| Nodemailer + Gmail | 무료, 설정 간단 | Gmail 앱 비밀번호 필요, 스팸 가능성 |
| SendGrid | 안정적 | 설정 복잡 |

→ Design 단계에서 확정

---

## 7. 수정 파일 목록

```
# 신규
prisma/schema.prisma                              # PasswordResetToken 모델
app/api/user/password/route.ts                    # 비밀번호 변경 API
app/api/auth/forgot-password/route.ts             # 리셋 요청 API
app/api/auth/reset-password/route.ts              # 리셋 실행 API
app/(auth)/forgot-password/page.tsx               # 비밀번호 찾기 페이지
app/(auth)/reset-password/page.tsx                # 비밀번호 재설정 페이지
components/dashboard/password-change-form.tsx      # 비밀번호 변경 폼
lib/email.ts                                       # 이메일 발송 유틸

# 수정
app/dashboard/settings/page.tsx                   # 비밀번호 변경 섹션 추가
components/auth/login-form.tsx                    # "비밀번호 찾기" 링크 추가
```

---

## 8. 보안 고려사항

- 리셋 토큰: crypto.randomBytes(32)로 생성, SHA-256 해시 저장
- 이메일 미존재 시에도 동일 응답 (이메일 유출 방지)
- 토큰 1회 사용 후 즉시 삭제
- 비밀번호 변경 시 현재 비밀번호 필수 확인
- Google 전용 계정(password: null)은 비밀번호 변경 UI 숨김

---

## 9. 테스트 시나리오

1. 로그인 후 설정에서 비밀번호 변경 → 새 비밀번호로 재로그인 성공
2. 현재 비밀번호 틀리게 입력 → 에러 메시지
3. 비밀번호 찾기 요청 → 이메일 수신 확인
4. 리셋 링크로 비밀번호 변경 → 새 비밀번호로 로그인 성공
5. 만료된 토큰으로 접근 → "링크가 만료되었습니다" 메시지
6. Google 전용 계정 → 비밀번호 변경 섹션 미표시
7. 미가입 이메일로 찾기 요청 → "이메일을 발송했습니다" (동일 응답)
