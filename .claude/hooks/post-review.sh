#!/bin/bash
# PostToolUse hook: 코드 작성 후 디자인 시스템 위반 검사
# write, edit 도구로 frontend/ 파일을 수정한 뒤 작동

INPUT=$(cat)
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool',''))" 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('input',{}); print(d.get('file_path','') or d.get('path',''))" 2>/dev/null)

# frontend/, styles.css, .html, .js, .css 파일만 대상
case "$FILE_PATH" in
  *frontend/*|*styles.css|*.html|*.js|*.css)
    ;;
  *)
    echo '{"decision": "approve"}'
    exit 0
    ;;
esac

# 파일이 존재하지 않으면 패스
if [ ! -f "$FILE_PATH" ]; then
  echo '{"decision": "approve"}'
  exit 0
fi

VIOLATIONS=""

# ── CSS 파일 검사 ──
if [[ "$FILE_PATH" == *.css ]]; then

  # 1.1 border-radius: 허용 값 외 사용 검사
  BAD_RADIUS=$(grep -n "border-radius" "$FILE_PATH" | grep -v "var(--radius" | grep -v "50%" | grep -v "border-radius-" | grep -vE "^\s*//" | grep -vE "^\s*/\*" || true)
  if [ -n "$BAD_RADIUS" ]; then
    VIOLATIONS="$VIOLATIONS [1.1 radius] var(--radius-*) 미사용: $BAD_RADIUS."
  fi

  # 1.4 hover 다중 속성 검사 (btn-primary 제외)
  # hover 블록 내 속성 수를 세는 간이 검사
  HOVER_BLOCKS=$(awk '/:hover/{found=1; selector=$0; count=0; next} found && /{/{next} found && /}/ {if(count>1 && selector !~ /btn-primary/) print selector" ("count" props)"; found=0} found && /:/{count++}' "$FILE_PATH" || true)
  if [ -n "$HOVER_BLOCKS" ]; then
    VIOLATIONS="$VIOLATIONS [1.4 hover] 다중 속성 변경: $HOVER_BLOCKS."
  fi

  # 1.5 shadow 검사 (허용 대상 외)
  BAD_SHADOW=$(grep -n "box-shadow" "$FILE_PATH" | grep -v "btn-primary" | grep -v "toast" | grep -v "modal" | grep -v "dropdown" | grep -vE "^\s*//" | grep -vE "^\s*/\*" || true)
  if [ -n "$BAD_SHADOW" ]; then
    VIOLATIONS="$VIOLATIONS [1.5 shadow] 허용 대상 외 사용: $BAD_SHADOW."
  fi

  # 색상 하드코딩 검사 (:root 밖에서 #hex 직접 사용)
  # 간이: #으로 시작하는 6자리 hex가 :root 밖에 있는지
  IN_ROOT=false
  BAD_COLORS=""
  while IFS= read -r line; do
    if echo "$line" | grep -q ":root"; then IN_ROOT=true; fi
    if $IN_ROOT && echo "$line" | grep -q "^}"; then IN_ROOT=false; fi
    if ! $IN_ROOT; then
      HEX=$(echo "$line" | grep -oE "#[0-9a-fA-F]{6}" | head -1)
      if [ -n "$HEX" ] && ! echo "$line" | grep -qE "^\s*/[/*]"; then
        BAD_COLORS="$BAD_COLORS $HEX"
      fi
    fi
  done < "$FILE_PATH"
  if [ -n "$BAD_COLORS" ]; then
    VIOLATIONS="$VIOLATIONS [색상] :root 밖 하드코딩:$BAD_COLORS. var() 사용 필요."
  fi
fi

# ── HTML 파일 검사 ──
if [[ "$FILE_PATH" == *.html ]]; then

  # 1.2 컴포넌트 수 검사
  SECTION_COUNT=$(grep -cE "<(section|header|footer)\s" "$FILE_PATH" || echo "0")
  if [ "$SECTION_COUNT" -gt 7 ]; then
    VIOLATIONS="$VIOLATIONS [1.2 컴포넌트] ${SECTION_COUNT}개 > 7개 한계 초과."
  fi

  # 1.3 div 3중 중첩 간이 검사
  NEST3=$(grep -cE "^\s{12,}<div" "$FILE_PATH" || echo "0")
  if [ "$NEST3" -gt 0 ]; then
    VIOLATIONS="$VIOLATIONS [1.3 중첩] div 3단계 이상 의심 (들여쓰기 12칸+)."
  fi
fi

# ── JS 파일 검사 ──
if [[ "$FILE_PATH" == *.js ]]; then

  # fetch() 직접 호출 검사 (apiFetch 정의 내부 제외)
  BAD_FETCH=$(grep -n "fetch(" "$FILE_PATH" | grep -v "apiFetch" | grep -vE "^\s*//" || true)
  if [ -n "$BAD_FETCH" ]; then
    VIOLATIONS="$VIOLATIONS [JS] fetch() 직접 호출: apiFetch() 래퍼 사용 필요."
  fi
fi

# ── 결과 반환 ──
if [ -n "$VIOLATIONS" ]; then
  # 큰따옴표와 줄바꿈을 이스케이프
  SAFE_VIOLATIONS=$(echo "$VIOLATIONS" | tr '\n' ' ' | sed 's/"/\\"/g')
  echo "{\"decision\": \"approve\", \"reason\": \"[code-review 위반 발견] $SAFE_VIOLATIONS 수정 필요.\"}"
else
  echo '{"decision": "approve", "reason": "[code-review] 검수 통과."}'
fi
