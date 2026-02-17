#!/bin/bash
# PostToolUse hook: 코드 품질 검증
# Write/Edit 도구로 소스 파일 수정한 뒤 작동
# 역할: 작성 "후" 위반 사항 검출 (컨벤션 리마인드는 pre-check 담당)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('input',{}); print(d.get('file_path','') or d.get('path',''))" 2>/dev/null)

# docs/, .claude/, config 파일 등은 검사 제외
case "$FILE_PATH" in
  *app/*|*components/*|*lib/*|*actions/*|*types/*)
    ;;
  *)
    echo '{"decision": "approve"}'
    exit 0
    ;;
esac

# 파일이 존재하지 않으면 패스 (삭제된 경우)
if [ ! -f "$FILE_PATH" ]; then
  echo '{"decision": "approve"}'
  exit 0
fi

VIOLATIONS=""

# ── TS/TSX 공통 검사 ──
if [[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.ts ]]; then

  # any 타입 사용 검사 (주석 제외)
  BAD_ANY=$(grep -n ": any" "$FILE_PATH" | grep -vE "^\s*//" | head -3 || true)
  if [ -n "$BAD_ANY" ]; then
    VIOLATIONS="$VIOLATIONS [타입] 'any' 사용 발견. 구체적 타입으로 변경 필요."
  fi
fi

# ── TSX 전용 검사 ──
if [[ "$FILE_PATH" == *.tsx ]]; then

  # use client 없이 클라이언트 훅/이벤트 사용
  HAS_CLIENT_HOOKS=$(grep -E "useState|useEffect|useRef|useCallback|useMemo|onClick|onChange|onSubmit" "$FILE_PATH" | head -1 || true)
  HAS_USE_CLIENT=$(grep -c '"use client"' "$FILE_PATH" || echo "0")
  if [ -n "$HAS_CLIENT_HOOKS" ] && [ "$HAS_USE_CLIENT" = "0" ]; then
    VIOLATIONS="$VIOLATIONS [use client] 클라이언트 훅/이벤트 사용 시 'use client' 지시문 필요."
  fi
fi

# ── CSS 전용 검사 ──
if [[ "$FILE_PATH" == *.css ]]; then

  # @apply 남용 검사 (3개 초과)
  APPLY_COUNT=$(grep -c "@apply" "$FILE_PATH" || echo "0")
  if [ "$APPLY_COUNT" -gt 3 ]; then
    VIOLATIONS="$VIOLATIONS [@apply] @apply ${APPLY_COUNT}회 사용. Tailwind 클래스 직접 사용 권장."
  fi
fi

# ── 결과 반환 ──
if [ -n "$VIOLATIONS" ]; then
  SAFE_VIOLATIONS=$(echo "$VIOLATIONS" | tr '\n' ' ' | sed 's/"/\\"/g')
  echo "{\"decision\": \"approve\", \"reason\": \"[post-review 위반]$SAFE_VIOLATIONS\"}"
else
  echo '{"decision": "approve", "reason": "[post-review] 검수 통과."}'
fi
