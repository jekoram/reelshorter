#!/bin/bash
# PreToolUse hook: PDCA 계획 확인 + 컨벤션 리마인드
# Write/Edit 도구로 소스 파일 수정 시 작동
# 역할: 작성 "전" 가이드라인 제공 (PDCA + 규칙 안내)

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

MESSAGES=""

# ── 1. PDCA 계획 존재 여부 확인 ──
PDCA_STATUS="docs/.pdca-status.json"
if [ -f "$PDCA_STATUS" ]; then
  ACTIVE=$(python3 -c "
import json
with open('$PDCA_STATUS') as f:
    d = json.load(f)
features = d.get('activeFeatures', [])
if features:
    primary = d.get('primaryFeature', features[0])
    phase = d.get('features', {}).get(primary, {}).get('phase', 'unknown')
    print(f'[PDCA] Feature: {primary}, Phase: {phase}.')
else:
    print('[PDCA] 활성 기능 없음. /pdca plan 으로 계획 먼저 작성 권장.')
" 2>/dev/null)
  MESSAGES="$ACTIVE"
else
  MESSAGES="[PDCA] .pdca-status.json 없음. /pdca plan 으로 계획 먼저 작성 권장."
fi

# ── 2. 파일 타입별 컨벤션 리마인드 ──
if [[ "$FILE_PATH" == *.css ]]; then
  MESSAGES="$MESSAGES [design-system] Dark 코스믹 테마. 글래스모피즘 패턴. tailwind.config.ts 커스텀 색상만 사용. 상세: docs/DESIGN_SYSTEM.md"
elif [[ "$FILE_PATH" == *.tsx ]]; then
  MESSAGES="$MESSAGES [conventions] PascalCase 컴포넌트, kebab-case 파일. Import 순서: React/Next > 외부 > 내부(@/) > 타입. 상세: docs/CONVENTIONS.md"
elif [[ "$FILE_PATH" == *.ts ]] && [[ "$FILE_PATH" != *.tsx ]]; then
  MESSAGES="$MESSAGES [features] API: NextRequest/NextResponse. Server Action: 'use server'. OAuth 토큰 서버사이드만. 상세: docs/FEATURES.md"
fi

echo "{\"decision\": \"approve\", \"reason\": \"$MESSAGES\"}"
