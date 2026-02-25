# Instagram / Facebook 연동 설정 기록

> 작성일: 2026-02-25
> 목적: ReelShorter 앱의 Instagram Reels 게시 기능을 위한 Meta 플랫폼 설정

---

## 계정 구조

| 구분 | 계정 | 비고 |
|------|------|------|
| Meta 앱 소유자 | (앱 소유 계정) | Meta Developer Console 관리 |
| Facebook 개발자 | 임홍주 (ID: 930822812642550) | 앱에 **개발자** 역할로 추가됨 |
| Facebook 페이지 | 이놀 (ID: 942351185638213) | Business Suite를 통해 관리 |
| Instagram 계정 | space_inol (ID: 17841466568803753) | 프로페셔널(비즈니스) 계정 |

**주의:** 앱 소유 계정 ≠ 페이지 관리 계정 (임홍주). 임홍주 계정은 Business Suite를 통해 페이지에 접근하며, 페이지의 직접 관리자(Page Role)는 아님.

---

## Meta Developer Console 설정

### 앱 정보
- **App ID:** 1646922339769844
- **App Secret:** dded0b2d80ba597d212aa95f9d2f08a9
- **앱 모드:** 개발 모드 (Development)

### Facebook Login for Business
- **Configuration ID:** 903881222257020
- **Token type:** User access token
- **Permissions (4개):**
  - `instagram_basic` - Instagram 프로필/미디어 읽기
  - `instagram_content_publish` - Instagram 게시물 생성
  - `pages_show_list` - 관리 중인 페이지 목록
  - `pages_read_engagement` - 페이지 콘텐츠/참여 데이터 읽기

### Redirect URI
- `https://reelshorter.vercel.app/api/oauth/instagram/callback`

### App Roles
- 임홍주: **개발자** (테스터가 아닌 개발자로 추가)

---

## Facebook 페이지 설정 (이놀)

1. Facebook 페이지 "이놀" 생성
2. **비즈니스 에셋**에 Instagram 계정 (space_inol) 추가
3. Business Suite에서 Instagram 연결 확인
   - "Facebook 관리자가 Instagram 메시지도 함께 관리" 권한 허용
4. **주의:** 임홍주 계정은 Business Suite를 통해 접근하므로, Graph API `/me/accounts`에서 이 페이지가 반환되지 않음

---

## Instagram 계정 설정 (space_inol)

1. **프로페셔널 계정**으로 전환 (비즈니스 또는 크리에이터)
2. Facebook 페이지 "이놀"에 연결
3. **프로필 설정 완료 필수** - 프로필 사진 등 기본 정보가 없으면 API 연동 실패할 수 있음

---

## OAuth 흐름에서 발생한 에러와 해결

### 1. "Invalid platform app"
- **원인:** `instagram.com/oauth/authorize` 사용 → Instagram Direct Login 경로
- **해결:** `facebook.com/v21.0/dialog/oauth` 사용 (Facebook Login for Business 경로)

### 2. "redirect URI is not whitelisted"
- **원인:** Redirect URI가 Facebook Login for Business 설정에 미등록
- **해결:** Meta Developer Console → Facebook Login for Business → Settings → Valid OAuth Redirect URIs에 추가

### 3. "Invalid Scopes"
- **원인:** Facebook Login for Business는 `scope` 파라미터를 지원하지 않음
- **해결:** `scope` 대신 `config_id` 파라미터 사용 (Configuration에 권한이 사전 설정됨)

### 4. "Instagram Business 계정이 Facebook 페이지에 연결되어 있지 않습니다"
- **원인 1:** 임홍주 계정이 Business Suite를 통해 페이지에 접근 → `/me/accounts` API가 빈 배열 반환
- **원인 2 (추정):** Instagram 계정 프로필 설정 미완료 (프로필 사진 없음)
- **해결:**
  - 코드에서 `/debug_token` → `granular_scopes`로 허용된 Page ID/IG ID를 직접 추출하는 방식으로 변경
  - Instagram 프로필 사진 등 기본 프로필 설정 완료

---

## Vercel 환경변수

| 변수 | 값 | 비고 |
|------|-----|------|
| `META_APP_ID` | 1646922339769844 | Meta 앱 ID |
| `META_APP_SECRET` | (설정됨) | Meta 앱 시크릿 |
| `META_CONFIG_ID` | 903881222257020 | Facebook Login for Business Configuration ID |

---

## 핵심 교훈

1. **Facebook Login for Business**는 일반 Facebook Login과 다르게 `config_id`를 사용한다
2. **Business Suite로 관리하는 페이지**는 `/me/accounts`에 나오지 않는다 → `/debug_token`의 `granular_scopes`를 통해 접근해야 함
3. **Instagram API 사용 필수 조건:**
   - Instagram 프로페셔널 (비즈니스/크리에이터) 계정
   - Facebook 페이지에 연결
   - 프로필 설정 완료 (프로필 사진 포함)
4. **개발 모드**에서는 앱에 역할(개발자/테스터)이 있는 계정만 OAuth 사용 가능
5. 앱 소유 계정과 실제 연동하는 계정이 다를 수 있으므로, 연동 계정도 앱에 역할 부여 필요
