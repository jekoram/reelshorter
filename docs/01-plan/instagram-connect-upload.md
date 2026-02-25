# Plan: Instagram 연결 및 Reels 업로드

> Team B | Priority: P1/P2 | Status: Plan
> Created: 2026-02-25

---

## 1. 목표

Instagram Business/Creator 계정을 OAuth로 연결하고, Instagram Reels로 영상을 업로드하는 기능을 구현한다.

---

## 2. 현재 상태

- Instagram OAuth route 2개 존재하나 501 stub 상태
  - `app/api/oauth/instagram/route.ts` → "Coming Soon"
  - `app/api/oauth/instagram/callback/route.ts` → "Coming Soon"
- `lib/instagram.ts` 미구현
- `app/api/publish/route.ts`에서 Instagram은 에러 반환 중 (line 128-135)
- Connection 모델에 `platform: "instagram"` 지원 이미 포함
- Dashboard UI에 Instagram 연결 블록은 있으나 비활성
- **Meta 비즈니스 승인 완료** (사용자 확인)

---

## 3. Meta 앱 사전 설정 (사용자 액션 필요)

### 3.1 Meta Developer Console에서 확인/설정할 항목

| 항목 | 설명 | 상태 |
|------|------|------|
| 비즈니스 인증 | Meta 비즈니스 등록 승인 | 완료 |
| Instagram Basic Display API | 더 이상 사용 안 함 (deprecated) | - |
| Instagram Graph API | Reels 업로드에 필요 | **확인 필요** |
| 필수 권한 승인 | `instagram_business_basic`, `instagram_business_content_publish` | **확인 필요** |
| 유효한 OAuth 리디렉션 URI | `{NEXTAUTH_URL}/api/oauth/instagram/callback` | **설정 필요** |
| 앱 모드 | Live 모드 (Development → Live 전환) | **확인 필요** |
| 테스트 Instagram 계정 | Business 또는 Creator 계정 | **확인 필요** |

### 3.2 환경변수 (.env)
```env
META_APP_ID=        # Meta App ID
META_APP_SECRET=    # Meta App Secret
```

---

## 4. 구현 범위

### 4.1 Instagram OAuth 연결
| 항목 | 파일 | 내용 |
|------|------|------|
| OAuth 시작 | `app/api/oauth/instagram/route.ts` | Meta OAuth URL로 리다이렉트 |
| OAuth 콜백 | `app/api/oauth/instagram/callback/route.ts` | 코드→토큰 교환, 장기토큰 변환, DB 저장 |
| Instagram API 유틸 | `lib/instagram.ts` | 토큰 교환, 계정 조회, 업로드 함수 |
| 연결 해제 | `app/api/connections/route.ts` | 기존 DELETE 엔드포인트 활용 (수정 불필요) |

### 4.2 Instagram Reels 업로드
| 항목 | 파일 | 내용 |
|------|------|------|
| Reels 업로드 함수 | `lib/instagram.ts` | Container 생성 → 상태 확인 → 게시 (3단계) |
| Publish API 연동 | `app/api/publish/route.ts` | Instagram stub 코드를 실제 업로드로 교체 |

### 4.3 UI 활성화
| 항목 | 파일 | 내용 |
|------|------|------|
| 연결 버튼 활성화 | `components/dashboard/platform-card.tsx` | "Coming Soon" 제거, 연결 버튼 활성화 |
| 업로드 폼 | `components/dashboard/upload-form.tsx` | Instagram 선택 시 업로드 활성화 |

---

## 5. Instagram Reels 업로드 흐름 (Graph API)

```
1. POST /{ig-user-id}/media
   - video_url: 공개 접근 가능한 URL (또는 서버에서 호스팅)
   - caption: 설명
   - media_type: REELS
   → container_id 반환

2. GET /{container_id}?fields=status_code
   - 폴링으로 FINISHED 될 때까지 대기 (최대 ~60초)

3. POST /{ig-user-id}/media_publish
   - creation_id: container_id
   → 최종 게시 ID 반환
```

### 핵심 제약사항
- **영상 URL이 공개 접근 가능해야 함**: Vercel에서 직접 버퍼 전송 불가
- 해결: 임시로 영상을 공개 URL에 업로드 후 Instagram에 전달
  - 옵션 A: Vercel Blob Storage 사용 (임시 업로드)
  - 옵션 B: AWS S3 presigned URL
  - 옵션 C: 다른 임시 스토리지
- **Reels 영상 규격**: 9:16 비율 권장, 최대 15분, MP4

---

## 6. 수정 파일 목록

```
app/api/oauth/instagram/route.ts           # 전면 재작성
app/api/oauth/instagram/callback/route.ts  # 전면 재작성
lib/instagram.ts                           # 신규 작성
app/api/publish/route.ts                   # Instagram 업로드 로직 추가
components/dashboard/upload-form.tsx       # Instagram 활성화 (UI 수정)
```

---

## 7. 토큰 관리

- 단기 토큰 (1시간) → 장기 토큰 (60일)으로 교환
- 장기 토큰 갱신: 만료 전 `GET /refresh_access_token` 호출
- AES-256 암호화 저장 (기존 encryption.ts 활용)

---

## 8. 테스트 시나리오

1. Instagram Business 계정 OAuth 연결 → Connection 생성 확인
2. 연결된 상태에서 Reels 업로드 → 성공 확인
3. YouTube + Instagram 동시 게시 → 양쪽 모두 성공
4. Instagram 연결 해제 → Connection 삭제 확인
5. 토큰 만료 시 갱신 → 자동 갱신 확인
6. 잘못된 영상 형식 업로드 시 → 적절한 에러 메시지

---

## 9. 주의사항

- Meta API rate limit: 시간당 200 요청 (앱 단위)
- 영상 처리에 시간 소요 → 폴링 로직에 타임아웃 필요
- Instagram Personal 계정은 API 지원 불가 (Business/Creator만)
- 영상 URL 공개 접근 문제는 Design 단계에서 스토리지 솔루션 확정 필요
