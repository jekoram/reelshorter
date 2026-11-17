# Design: Blob 직접 업로드

## 흐름
1. 브라우저: `upload()` (`@vercel/blob/client`, multipart) → `POST /api/blob/upload`로 토큰 요청 → Blob에 직접 PUT
2. 브라우저: `POST /api/publish` (JSON: `blobUrl`, `fileName`, `mimeType`, `platforms`)
3. 서버: Instagram은 `blobUrl` 그대로 사용 / YouTube는 `fetch(blobUrl)` 본문을 스트림으로 전달
4. 서버: 완료 후 `del(blobUrl)` (finally)

## 변경 파일
| 파일 | 변경 |
|------|------|
| `app/api/blob/upload/route.ts` (신규) | `handleUpload`. 세션 필수, 허용 타입 mp4/quicktime/webm, 최대 499MB, 경로 `uploads/` |
| `app/api/publish/route.ts` | formData → JSON. `blobUrl` 검증(https, `*.public.blob.vercel-storage.com`, `/uploads/` 경로) 후 위 흐름 |
| `lib/instagram.ts` | `videoBuffer`+`put` → `videoUrl`. 임시 Blob 삭제는 route가 담당 |
| `lib/youtube.ts` | `file: Buffer` → `stream: Readable` |
| `components/dashboard/upload-form.tsx` | Blob 업로드 후 JSON 게시. 응답은 text로 읽고 JSON 파싱 실패 시 한국어 메시지 |

## 보안
- 토큰 발급은 로그인 사용자만, 타입/크기 제한을 토큰에 포함
- `blobUrl`은 우리 Blob 스토어 호스트·`uploads/` 경로만 허용 (임의 URL fetch 방지)

## 검증
- 6MB 이상 영상으로 업로드 → 413 없이 진행
- 잘못된 `blobUrl` → 400
- 실패 시에도 임시 Blob 삭제
