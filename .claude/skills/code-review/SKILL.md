---
name: "ReelShorts 코드 검수"
description: "생성된 HTML/CSS/JS 코드가 DESIGN_SYSTEM.md와 CONVENTIONS.md를 준수하는지 검사하는 체크리스트. 코드 리뷰, 검수, 검증, 품질 확인 시 반드시 이 스킬을 따른다. 트리거: 코드 검수, 리뷰, 검증, 체크, 품질 확인, 제약 확인"
---

## 검수 절차

코드 생성/수정 후 아래 순서로 검사한다. 위반 시 즉시 수정.

## 상세 체크리스트

`docs/CODE_REVIEW_HOOK.md` 파일을 읽고 따른다. 핵심 요약:

### 즉시 탈락 (Anti-Pattern)

- 문서에 없는 CSS 클래스 신규 생성 → 위반
- 색상 하드코딩 (`:root` 밖) → 위반
- "흔히 쓰는 패턴" 근거 없이 추가 → 위반

### 제약 검사 (순서대로)

1. **border-radius**: `--radius-xs`(4px), `--radius-sm`(8px), `--radius-full`, `50%`만 허용
2. **hover**: 속성 1개만 변경. `.btn-primary`만 2개 예외
3. **shadow**: Modal/Dropdown/Toast/`.btn-primary`만 허용
4. **컴포넌트 수**: 한 페이지 최대 7개
5. **div 중첩**: 최대 2단계
6. **CSS 변수**: 색상은 반드시 `var()` 사용
7. **클래스명**: `kebab-case`만
8. **font-size**: 문서에 정의된 값만
9. **JS API 호출**: `apiFetch()` 래퍼만 사용
