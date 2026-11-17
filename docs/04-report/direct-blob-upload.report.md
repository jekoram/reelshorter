# Report: 영상 업로드 4.5MB 제한 해소 (Blob 직접 업로드)

## 원인
- `/api/publish`가 영상을 직접 수신 → Vercel 본문 한도 4.5MB 초과 시 text/plain 413
- 클라이언트 `response.json()` 실패 → iOS Safari "The string did not match the expected pattern"
- 화면 안내(499MB)와 실제 한도 불일치

## 조치
- 브라우저 → Vercel Blob 직접 업로드 (`/api/blob/upload` 토큰 발급, 로그인 필수, 타입/499MB 제한)
- `/api/publish`는 `blobUrl`(+검증)을 JSON으로 수신, Instagram은 URL 재사용, YouTube는 스트리밍, 종료 시 Blob 삭제
- 클라이언트: 응답을 text로 읽고 파싱 실패 시 한국어 메시지

## Check
- `tsc --noEmit`, `next build` 통과
- 설계 대비 구현 일치 (설계 외: `actions/publish.ts`는 미사용이나 타입 호환 위해 `Readable.from(buffer)`로 수정)
- 미검증: 실제 영상 업로드/게시 E2E (배포 후 모바일 테스트 필요)

## 후속 고려
- 업로드 진행률 표시, 대용량 YouTube 스트리밍 시간(함수 300초 한도) 확인
