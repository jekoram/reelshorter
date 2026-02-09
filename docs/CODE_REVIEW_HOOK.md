# ReelShorts 코드 검수 가이드

> 이 파일은 생성된 HTML/CSS/JS 코드가 DESIGN_SYSTEM.md를 준수하는지 확인하는 체크리스트이다.
> 코드를 생성하거나 수정한 직후, 이 파일의 규칙에 따라 검수한다.

---

## 검수 절차

1. 대상 파일의 코드를 읽는다
2. 아래 체크리스트를 위에서 아래로 순서대로 확인한다
3. 위반 항목이 있으면 즉시 수정한다
4. 수정 후 verify_docs.py를 실행하여 교차 검증한다

---

## 체크리스트

### 0. Anti-Pattern (최우선)

- [ ] 문서(DESIGN_SYSTEM.md)에 정의되지 않은 CSS 클래스를 새로 만들지 않았는가?
- [ ] 문서에 정의되지 않은 색상값을 하드코딩하지 않았는가?
- [ ] "흔히 쓰는 패턴"을 근거 없이 추가하지 않았는가?

위반 시: 해당 코드를 삭제하고, 필요하면 DESIGN_SYSTEM.md를 먼저 업데이트한 뒤 코드에 반영한다.

---

### 1.1 Border Radius

허용 값 목록 (이것만 사용 가능):

| 변수 | 값 | 사용 대상 |
|------|-----|----------|
| `--radius-xs` | 4px | 기본값 (폼 입력, 일반 요소) |
| `--radius-sm` | 8px | 글래스 카드, 업로드 영역, 아이콘 박스, 토스트 |
| `--radius-full` | 9999px | 버튼 pill, 프로그레스 바, 원형 아이콘 |
| `50%` | - | 플랫폼 아이콘, orb |

검사 방법:
```
코드에서 border-radius를 검색한다.
→ 위 4가지가 아닌 값이 있으면 위반.
→ px 직접 입력(예: border-radius: 12px)은 위반.
```

---

### 1.2 화면당 컴포넌트 수

```
HTML 파일에서 최상위 <section>, <header>, <footer>를 센다.
→ 7개 초과하면 위반.
```

---

### 1.3 컨테이너 중첩

```
HTML에서 아래 패턴을 검색한다:
→ <div> 안에 <div> 안에 <div> (3중 이상) = 위반
→ <section> 안에 .container 안에 .wrapper = 위반
```

---

### 1.4 단일 시각적 피드백

```
CSS에서 :hover 블록을 모두 찾는다.
→ 속성 2개 이상 변경하면 위반.
→ 예외: .btn-primary:hover만 filter + transform 2개 허용.
```

---

### 1.5 Shadow 사용 제한

```
CSS에서 box-shadow를 검색한다.
→ 허용 대상: .btn-primary, .toast, .modal, .dropdown
→ 그 외 요소에 있으면 위반.
```

---

### 1.6 Header > Sidebar 위계

```
HTML 구조를 확인한다.
→ <header> 안에 sidebar가 있으면 위반.
→ <header>가 body 최상단이 아니면 위반.
```

---

### 2. CSS 변수 사용

```
CSS에서 색상값(#, rgb, rgba, hsl)을 검색한다.
→ :root 정의 안에 있으면 OK.
→ :root 밖에서 직접 색상값을 쓰면 위반.
   대신 var(--변수명)을 사용해야 한다.

예외:
→ linear-gradient 안의 중간값 (#121230, #1a1030 등 body 배경용)
→ rgba(255, 255, 255, 0.xx) 형태 (흰색 투명도 변형)
```

---

### 3. 클래스명 규칙

```
CSS/HTML에서 클래스명을 확인한다.
→ kebab-case가 아니면 위반. (예: uploadArea → upload-area)
→ 문서에 정의된 클래스 목록:
   .glass-card, .btn-primary, .btn-secondary,
   .upload-area, .icon-box, .floating-orbs, .orb,
   .logo, .heading-xl, .subtitle, .card-title, .card-desc,
   .form-input, .progress-bar, .progress-bar__fill,
   .toast, .toast--success, .toast--error, .toast--info,
   .container, .page-bg
```

---

### 4. 타이포그래피

```
CSS에서 font-size를 검색한다.
→ 허용 값: 0.75rem, 0.875rem, 1rem, 1.125rem, 1.5rem, 2.5rem, 3.5rem
→ 그 외 크기가 있으면 문서에 정의되어 있는지 확인.

font-family를 검색한다.
→ 'Pretendard Variable' 이외의 폰트가 있으면 위반.
```

---

### 5. 간격

```
CSS에서 padding, margin, gap 값을 검색한다.
→ 가능하면 var(--space-*) 사용.
→ px 직접 입력은 예외적 상황만 허용 (예: 업로드 영역 padding: 40px).
```

---

### 6. JS 패턴

```
JS에서 API 호출을 검색한다.
→ fetch() 직접 사용 = 위반. apiFetch() 래퍼를 사용해야 한다.
→ 예외: apiFetch 함수 내부의 fetch()

JS에서 DOM 조작을 검색한다.
→ document.write() 사용 = 위반.
→ innerHTML에 사용자 입력 삽입 = 위반 (XSS).
```

---

## 자동 검증 스크립트

위 체크리스트 중 기계적으로 검사 가능한 항목은 `verify_docs.py`로 자동화되어 있다.

실행:
```bash
python3 verify_docs.py
```

검사 항목:
- CSS 변수 정의 vs 사용 교차 검증
- 삭제된 변수 참조 검사
- border-radius 값 범위 검사
- hover 다중 속성 검사
- shadow 허용 대상 검사
- 컴포넌트 수 검사
- API 엔드포인트 일관성
- JS 함수 정의 vs 호출 검사
