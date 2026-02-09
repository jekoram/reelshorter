# ReelShorts 기능 명세

> 이 파일은 서비스의 핵심 기능과 구현 규칙을 정의합니다.
> 프론트엔드/백엔드 기능 개발 시 이 파일을 참조하세요.

---

## 서비스 개요

ReelShorts는 사용자가 영상 하나를 업로드하면 **YouTube Shorts**와 **Instagram Reels**에 동시에 게시해주는 서비스.

핵심 플로우:
```
영상 업로드 → 플랫폼 계정 연결 확인 → 제목/설명 입력 → 동시 게시 → 결과 확인
```

---

## 1. 동영상 업로드

### 클라이언트 검증 규칙

| 항목 | 조건 | 초과 시 |
|------|------|---------|
| 비율 | 9:16 (세로형) | 경고 표시 + 업로드는 허용 |
| 길이 | 60초 이하 | 경고 표시 (플랫폼 제한 안내) |
| 형식 | MP4, MOV | 그 외 형식은 업로드 차단 |
| 파일 크기 | 500MB 이하 | 업로드 차단 + 안내 메시지 |

### 업로드 UX

- 라이브러리: `react-dropzone`
- 드래그앤드롭 + 클릭 업로드 모두 지원
- 업로드 중 **Progress Bar** 표시 필수 (퍼센트 + 바)
- 업로드 완료 후 **썸네일 미리보기** 표시
- 업로드 실패 시 **재시도 버튼** 제공

### 상태 관리 (Zustand)

```ts
interface UploadState {
  file: File | null;
  progress: number;          // 0~100
  status: 'idle' | 'uploading' | 'success' | 'error';
  thumbnailUrl: string | null;
  error: string | null;
}
```

---

## 2. OAuth 인증 (플랫폼 연동)

### 지원 플랫폼

| 플랫폼 | API | 용도 |
|--------|-----|------|
| YouTube | YouTube Data API v3 | Shorts 업로드 |
| Instagram | Instagram Graph API (via Facebook) | Reels 업로드 |

### 인증 플로우

```
1. 사용자가 "YouTube 연결" 또는 "Instagram 연결" 버튼 클릭
2. 백엔드 API로 리다이렉트 URL 요청 (GET /api/auth/{platform})
3. 해당 플랫폼 OAuth 페이지로 리다이렉트
4. 사용자 승인 후 콜백 URL로 돌아옴 (/auth/callback?platform=youtube&code=...)
5. 백엔드에서 code → token 교환, HttpOnly Cookie에 저장
6. 프론트엔드에서 연결 상태 갱신
```

### 프론트엔드 규칙

- Access Token은 **절대 프론트엔드에 노출하지 않음** (HttpOnly Cookie)
- 연결 상태는 API로 확인: `GET /api/auth/status` → `{ youtube: boolean, instagram: boolean }`
- UI에서 연결/미연결 상태를 **아이콘 활성화/비활성화**로 구분
  - 연결됨: 아이콘 컬러 + 체크 뱃지
  - 미연결: 회색 아이콘 + "연결하기" 텍스트

### 상태 관리 (Zustand)

```ts
interface AuthState {
  isYoutubeConnected: boolean;
  isInstagramConnected: boolean;
  youtubeChannelName: string | null;
  instagramUsername: string | null;
}
```

---

## 3. 동시 게시

### 게시 플로우

```
1. 업로드된 영상 + 제목/설명 입력
2. 게시 대상 플랫폼 선택 (연결된 플랫폼만 선택 가능)
3. "게시" 버튼 클릭
4. 백엔드 API 호출: POST /api/publish
   - body: { videoId, title, description, platforms: ['youtube', 'instagram'] }
5. 각 플랫폼별 게시 상태를 실시간 표시
6. 완료 후 각 플랫폼 게시물 링크 제공
```

### 게시 상태 UI

각 플랫폼별 독립적인 상태 표시:

| 상태 | UI 표현 |
|------|---------|
| 대기 | 회색 로딩 아이콘 |
| 진행 중 | 스피너 + "게시 중..." |
| 성공 | 초록 체크 + 게시물 링크 |
| 실패 | 빨간 X + 에러 메시지 + 재시도 버튼 |

---

## 4. API 엔드포인트 (프론트엔드 관점)

프론트엔드에서 호출하는 백엔드 API 목록:

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/auth/status` | 플랫폼 연결 상태 확인 |
| GET | `/api/auth/{platform}` | OAuth 리다이렉트 URL 받기 |
| POST | `/api/auth/callback` | OAuth 콜백 처리 |
| DELETE | `/api/auth/{platform}` | 플랫폼 연결 해제 |
| POST | `/api/upload` | 영상 업로드 |
| POST | `/api/publish` | 동시 게시 실행 |
| GET | `/api/publish/{id}/status` | 게시 상태 폴링 |

### TanStack Query 키 컨벤션

```ts
queryKey: ['auth', 'status']           // 인증 상태
queryKey: ['upload', uploadId]          // 업로드 상태
queryKey: ['publish', publishId]        // 게시 상태
```

---

## 5. 에러 처리 규칙

| 에러 유형 | 처리 방식 |
|-----------|-----------|
| 네트워크 오류 | 토스트 알림 + 재시도 안내 |
| 인증 만료 | 재연결 유도 모달 |
| 파일 검증 실패 | 인라인 에러 메시지 (업로드 영역 하단) |
| 게시 실패 | 플랫폼별 개별 에러 + 재시도 버튼 |
| 서버 오류 (5xx) | "잠시 후 다시 시도해주세요" 토스트 |
