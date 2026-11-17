# Plan: 영상 업로드 4.5MB 제한 해소 (Blob 직접 업로드)

## 문제
- 증상: 모바일(iOS Safari)에서 업로드 버튼 → "The string did not match the expected pattern"
- 원인: `/api/publish`가 영상을 multipart로 직접 받는데, Vercel 함수 요청 본문 한도는 4.5MB.
  초과 시 Vercel이 JSON이 아닌 text/plain 413(`FUNCTION_PAYLOAD_TOO_LARGE`)을 반환 →
  클라이언트의 `response.json()`이 SyntaxError → Safari 문구로 표시
- 화면 안내는 "최대 499MB"라 실제 동작과 불일치 (재현: 6MB 요청 → 413 확인)

## 목표
- 499MB 이하 영상이 실제로 업로드·게시됨
- 서버가 JSON이 아닌 응답을 줘도 사용자에게 한국어 에러 메시지 표시

## 범위
- 브라우저 → Vercel Blob 직접 업로드 (`@vercel/blob/client`, 토큰 발급 API 추가)
- `/api/publish`는 영상 대신 Blob URL을 JSON으로 수신
- Instagram: Blob URL 재사용 (서버 재업로드 제거), YouTube: Blob에서 스트리밍
- 게시 후 임시 Blob 삭제
- 클라이언트 응답 파싱 방어

## 범위 외
- 업로드 진행률 UI, 499MB 제한 값 변경
