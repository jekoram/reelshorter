# ReelShorts 기능 명세 (HTML/CSS/JS + FastAPI)

> 이 파일은 서비스의 핵심 기능과 프론트↔백엔드 연동 규칙을 정의합니다.

---

## 서비스 개요

사용자가 영상을 업로드하면 **YouTube Shorts**와 **Instagram Reels**에 동시에 게시.

핵심 플로우:
```
회원가입/로그인 → 플랫폼 계정 연결 → 영상 업로드 → 제목/설명 입력 → 동시 게시 → 결과 확인
```

---

## 1. 회원 인증

### 가입/로그인 (index.html)

프론트엔드(app.js):
```js
// 회원가입
await apiFetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// 로그인 → JWT 토큰 받아서 localStorage에 저장
const { access_token } = await apiFetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
localStorage.setItem('token', access_token);
```

### 인증 상태 체크

```js
// 모든 페이지 로드 시 (dashboard, settings)
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';  // 로그인 페이지로
    return;
  }
}
```

### 로그아웃

```js
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}
```

### 공통 API 호출 래퍼

```js
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || '요청 실패');
    }
    return await res.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}
```

### API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 → JWT 반환 |
| GET | `/api/auth/me` | 현재 유저 정보 |

---

## 2. OAuth 플랫폼 연동

### 연결 플로우 (settings.html)

```
1. "YouTube 연결" 버튼 클릭
2. → GET /api/oauth/youtube 호출
3. → 서버가 Google 인증 URL 반환
4. → 브라우저가 해당 URL로 이동 (구글 로그인 화면)
5. → 사용자 승인 후 콜백 URL로 돌아옴
6. → GET /api/oauth/youtube/callback?code=... 서버가 처리
7. → 서버가 토큰 교환 + 암호화 저장
8. → settings.html로 리다이렉트, "연결 완료 ✅" 표시
```

### 프론트엔드 구현

```js
// "YouTube 연결" 버튼 클릭 시
async function connectYouTube() {
  const { auth_url } = await apiFetch('/api/oauth/youtube');
  window.location.href = auth_url;  // 구글 로그인으로 이동
}

// 연결 상태 표시
async function loadConnectionStatus() {
  const status = await apiFetch('/api/oauth/status');
  // status: { youtube: { connected: true, username: "채널명" }, instagram: { connected: false } }

  // YouTube 상태 반영
  if (status.youtube.connected) {
    youtubeBtn.textContent = `YouTube 연결됨: ${status.youtube.username}`;
    youtubeBtn.classList.add('connected');
  }
}

// 연결 해제
async function disconnectYouTube() {
  await apiFetch('/api/oauth/youtube', { method: 'DELETE' });
  loadConnectionStatus();  // 상태 갱신
}
```

### 연결 상태 UI

| 상태 | 표시 |
|------|------|
| 미연결 | 회색 아이콘 + "YouTube 연결" 버튼 |
| 연결됨 | 컬러 아이콘 + 채널명 + "연결 해제" 버튼 |

### API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/oauth/status` | 모든 플랫폼 연결 상태 |
| GET | `/api/oauth/youtube` | Google 인증 URL 반환 |
| GET | `/api/oauth/youtube/callback` | 콜백 처리 (서버→서버) |
| DELETE | `/api/oauth/youtube` | 연결 해제 |
| GET | `/api/oauth/instagram` | Meta 인증 URL 반환 |
| GET | `/api/oauth/instagram/callback` | 콜백 처리 |
| DELETE | `/api/oauth/instagram` | 연결 해제 |

---

## 3. 동영상 업로드 + 게시

### 업로드 검증 (클라이언트, app.js에서 처리)

| 항목 | 조건 | 초과 시 |
|------|------|---------|
| 비율 | 9:16 (세로형) | 경고 표시, 업로드는 허용 |
| 길이 | 60초 이하 | 경고 표시 |
| 형식 | MP4, MOV | 차단 + 안내 |
| 파일 크기 | 500MB 이하 | 차단 + 안내 |

### 업로드 UX (dashboard.html)

```js
// 드래그앤드롭 구현 (라이브러리 없이 Vanilla JS)
const dropzone = document.getElementById('upload-dropzone');

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  validateAndPreview(file);
});

// 파일 선택(클릭) 지원
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
  validateAndPreview(e.target.files[0]);
});
```

### 게시 플로우

```js
async function publishVideo() {
  const formData = new FormData();
  formData.append('video', selectedFile);
  formData.append('title', document.getElementById('video-title').value);
  formData.append('description', document.getElementById('video-desc').value);
  formData.append('platforms', JSON.stringify(selectedPlatforms)); // ['youtube', 'instagram']

  // Progress 표시
  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    updateProgressBar(percent);
  };

  xhr.open('POST', '/api/publish');
  xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
  xhr.send(formData);
}
```

### 게시 상태 UI

각 플랫폼별 독립 표시:

| 상태 | UI |
|------|-----|
| 대기 | 회색 아이콘 |
| 업로드 중 | 프로그레스 바 + 퍼센트 |
| 게시 중 | 스피너 + "게시 중..." |
| 성공 | 초록 체크 + 게시물 링크 |
| 실패 | 빨간 X + 에러 메시지 + 재시도 버튼 |

### API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/publish` | 영상 업로드 + 게시 요청 |
| GET | `/api/publish/{id}/status` | 게시 상태 폴링 |
| GET | `/api/logs` | 게시 이력 목록 |

---

## 4. 에러 처리

| 에러 유형 | 프론트엔드 처리 |
|-----------|----------------|
| 네트워크 오류 | 토스트: "서버와 연결할 수 없습니다" |
| 401 Unauthorized | 자동으로 로그인 페이지 이동 |
| 파일 검증 실패 | 업로드 영역 아래 인라인 에러 |
| OAuth 실패 | 토스트 + 재연결 안내 |
| 게시 실패 | 플랫폼별 에러 메시지 + 재시도 버튼 |
| 서버 오류 (5xx) | 토스트: "잠시 후 다시 시도해주세요" |

### 토스트 알림 구현

```js
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;  // toast--error, toast--success, toast--info
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```
