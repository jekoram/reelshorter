#!/bin/bash
# PreToolUse hook: 코드 작성 전 디자인 시스템/컨벤션 규칙 리마인드
# write, edit 도구로 TSX/TS/CSS 파일을 수정할 때 작동

INPUT=$(cat)
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool',''))" 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('input',{}); print(d.get('file_path','') or d.get('path',''))" 2>/dev/null)

# app/, components/, lib/, actions/, types/ 하위 TSX/TS/CSS 파일만 대상
case "$FILE_PATH" in
  *app/*|*components/*|*lib/*|*actions/*|*types/*|*.tsx|*.ts|*.css)
    RULES=""

    # CSS 파일 → 디자인 시스템 규칙
    if [[ "$FILE_PATH" == *.css ]]; then
      RULES="[design-system] Dark 코스믹 테마. 글래스모피즘: bg-white/[0.08] backdrop-blur-md border-white/[0.15] rounded-2xl. CTA: bg-gradient-to-r from-accent-red to-accent-orange. tailwind.config.ts 커스텀 색상만 사용. 상세: docs/DESIGN_SYSTEM.md 참조."
    fi

    # TSX 파일 → 컨벤션 + 디자인 규칙
    if [[ "$FILE_PATH" == *.tsx ]]; then
      RULES="[conventions] 컴포넌트 PascalCase, 파일 kebab-case. 'use client'는 클라이언트 훅 사용 시만. Props interface 정의. Import 순서: React/Next → 외부 → 내부(@/) → 타입. Tailwind 클래스 순서: 레이아웃→크기→여백→배경→테두리→텍스트. 상세: docs/CONVENTIONS.md, docs/DESIGN_SYSTEM.md 참조."
    fi

    # TS 파일 (비-TSX) → 기능 규칙
    if [[ "$FILE_PATH" == *.ts ]] && [[ "$FILE_PATH" != *.tsx ]]; then
      RULES="[features] API Route: NextRequest/NextResponse 사용. Server Action: 'use server' 지시문. OAuth 토큰 서버 사이드에서만 처리. 암호화: lib/encryption.ts. 상세: docs/FEATURES.md, docs/CONVENTIONS.md 참조."
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
