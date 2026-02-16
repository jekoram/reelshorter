---
name: "ReelShorts 코드 검수"
description: "생성된 TSX/TS/CSS 코드가 DESIGN_SYSTEM.md와 CONVENTIONS.md를 준수하는지 검사하는 체크리스트. 코드 리뷰, 검수, 검증, 품질 확인 시 반드시 이 스킬을 따른다. 트리거: 코드 검수, 리뷰, 검증, 체크, 품질 확인, 제약 확인"
---

## 검수 절차

코드 생성/수정 후 아래 순서로 검사한다. 위반 시 즉시 수정.

## 상세 체크리스트

`docs/CONVENTIONS.md`와 `docs/DESIGN_SYSTEM.md` 파일을 읽고 따른다. 핵심 요약:

### 즉시 탈락 (Anti-Pattern)

- 문서에 없는 Tailwind 클래스 조합 임의 생성 → 위반
- 디자인 시스템 색상 외 하드코딩 → 위반
- "use client" 없이 클라이언트 훅 사용 → 위반
- `any` 타입 남용 → 위반

### 제약 검사 (순서대로)

1. **글래스모피즘**: `bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl` 패턴 준수
2. **CTA 버튼**: `bg-gradient-to-r from-accent-red to-accent-orange rounded-full` 패턴 준수
3. **컬러**: `tailwind.config.ts`에 정의된 커스텀 색상만 사용
4. **컴포넌트 구조**: imports → interface → export function → hooks → handlers → render
5. **네이밍**: 파일 kebab-case, 컴포넌트 PascalCase, 함수 camelCase
6. **Tailwind 순서**: 레이아웃 → 크기 → 여백 → 배경 → 테두리 → 텍스트 → 기타
7. **Import 순서**: React/Next → 외부 → 내부(@/) → 타입
8. **반응형**: 모바일 퍼스트, md/lg 브레이크포인트
9. **"use client"**: useState, onClick 등 사용 시 필수
