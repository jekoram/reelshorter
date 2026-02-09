---
name: "ReelShorts 디자인 시스템"
description: "ReelShorts 프로젝트의 CSS 스타일 작성 규칙. CSS 파일 작성, 스타일 수정, 색상/타이포/버튼/카드 등 UI 요소 구현 시 반드시 이 스킬을 따른다. 트리거: CSS 작성, styles.css 수정, 색상 변경, 버튼 스타일, 글래스모피즘, 반응형, 레이아웃"
---

## 최우선 규칙

이 문서에 정의된 값과 패턴만 사용한다. 문서에 없는 스타일을 임의로 추가하지 않는다.

## 상세 규칙

`docs/DESIGN_SYSTEM.md` 파일을 읽고 따른다. 핵심 요약:

### 필수 제약 (위반 즉시 수정)

- **border-radius**: 기본 4px(`--radius-xs`). 8px은 카드/업로드만. pill/원형은 `--radius-full`
- **hover**: 속성 1개만 변경. 예외: `.btn-primary`만 2개 허용
- **shadow**: Modal, Dropdown, Toast, `.btn-primary`만 허용
- **컴포넌트 수**: 한 화면 최대 7개
- **중첩**: div 3단계 이상 금지
- **색상**: `:root` 밖에서 색상값 하드코딩 금지 → `var()` 사용

### CSS 변수 체계

색상, 간격, 모서리 모두 CSS 변수로 정의되어 있다. 정확한 변수명과 값은 `docs/DESIGN_SYSTEM.md`의 `:root` 블록을 참조한다.

### 공용 컴포넌트

`.glass-card`, `.btn-primary`, `.btn-secondary`, `.upload-area`, `.form-input`, `.progress-bar`, `.toast` — 각각의 정확한 CSS는 `docs/DESIGN_SYSTEM.md` 참조.
