#!/bin/bash
# PreToolUse hook: 코드 작성 전 디자인 시스템/컨벤션 규칙 리마인드
# write, edit 도구로 frontend/ 파일을 수정할 때 작동

INPUT=$(cat)
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool',''))" 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('input',{}); print(d.get('file_path','') or d.get('path',''))" 2>/dev/null)

# frontend/, styles.css, .html, .js, .css 파일만 대상
case "$FILE_PATH" in
  *frontend/*|*styles.css|*.html|*.js|*.css)
    RULES=""

    # CSS 파일 → 디자인 시스템 규칙
    if [[ "$FILE_PATH" == *.css ]]; then
      RULES="[design-system] border-radius: --radius-xs(4px) 기본, --radius-sm(8px) 카드/업로드만, --radius-full pill/원형만. hover: 속성 1개만(CTA 예외). shadow: Modal/Toast/CTA만. 색상: var() 필수. 문서에 없는 스타일 추가 금지. 상세: docs/DESIGN_SYSTEM.md 참조."
    fi

    # HTML 파일 → 랜딩페이지 + 컨벤션 규칙
    if [[ "$FILE_PATH" == *.html ]]; then
      RULES="[conventions] 클래스명 kebab-case. div 3중 중첩 금지. 컴포넌트 최대 7개. [landing-page] index.html은 7섹션(Header/Hero/Upload/Platforms/Features/CTA/Footer). 상세: docs/pages/LANDING.md, docs/CONVENTIONS.md 참조."
    fi

    # JS 파일 → 컨벤션 + 기능 규칙
    if [[ "$FILE_PATH" == *.js ]]; then
      RULES="[conventions] 함수 camelCase, 상수 UPPER_SNAKE_CASE. API는 apiFetch() 래퍼만 사용. fetch() 직접 호출 금지. [features] OAuth 토큰 프론트 노출 금지. 상세: docs/CONVENTIONS.md, docs/FEATURES.md 참조."
    fi

    if [ -n "$RULES" ]; then
      echo "{\"decision\": \"approve\", \"reason\": \"$RULES\"}"
    else
      echo '{"decision": "approve"}'
    fi
    ;;
  *)
    echo '{"decision": "approve"}'
    ;;
esac
