# Components Context - components/claude.md

> UI 컴포넌트, Tailwind 스타일링 작업 시 참조
> 이 파일은 `components/claude.md`에 저장

---

## 이 폴더 구조

```
components/
├── claude.md               ← 이 파일
├── ui/                     # 기본 UI 요소
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── loading.tsx
│   └── alert.tsx
├── layout/                 # 레이아웃
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── auth/                   # 인증 관련
│   ├── login-form.tsx
│   └── signup-form.tsx
├── dashboard/              # 대시보드 관련
│   ├── upload-form.tsx
│   ├── platform-card.tsx
│   └── history-table.tsx
└── providers/              # Context Providers
    └── session-provider.tsx
```

---

## 컴포넌트 작성 규칙

### 파일 네이밍
```
kebab-case.tsx
예: upload-form.tsx, platform-card.tsx
```

### 컴포넌트 구조
```typescript
// 1. imports
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. types
interface UploadFormProps {
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
}

// 3. component
export function UploadForm({ onSubmit, isLoading = false }: UploadFormProps) {
  // hooks
  const [file, setFile] = useState<File | null>(null)

  // handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ...
  }

  // render
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  )
}
```

---

## Tailwind 패턴

### 색상 팔레트
```
Primary:    blue-600, blue-700 (hover)
Success:    green-600
Error:      red-600
Warning:    yellow-600
Gray:       gray-100 ~ gray-900
Background: white, gray-50
```

### 자주 쓰는 클래스 조합

```tsx
// 버튼 (Primary)
className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"

// 버튼 (Secondary)
className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"

// 버튼 (Danger)
className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"

// 인풋
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"

// 카드
className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"

// 에러 메시지
className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"

// 성공 메시지
className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm"
```

---

## 기본 UI 컴포넌트 템플릿

### Button

```typescript
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  isLoading?: boolean
}

export function Button({
  children,
  variant = "primary",
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "로딩..." : children}
    </button>
  )
}
```

### Input

```typescript
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
```

### Card

```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  )
}
```

### Alert

```typescript
// components/ui/alert.tsx
interface AlertProps {
  type: "success" | "error" | "warning"
  message: string
}

export function Alert({ type, message }: AlertProps) {
  const styles = {
    success: "bg-green-50 text-green-600",
    error: "bg-red-50 text-red-600",
    warning: "bg-yellow-50 text-yellow-600",
  }

  return (
    <div className={`px-4 py-3 rounded-lg text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}
```

---

## 대시보드 컴포넌트

### PlatformCard

```typescript
// components/dashboard/platform-card.tsx
interface PlatformCardProps {
  platform: "youtube" | "instagram"
  isConnected: boolean
  username?: string
  onConnect: () => void
  onDisconnect: () => void
}

export function PlatformCard({
  platform,
  isConnected,
  username,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const platformInfo = {
    youtube: { name: "YouTube", icon: "🔴", color: "red" },
    instagram: { name: "Instagram", icon: "📷", color: "pink" },
  }

  const info = platformInfo[platform]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h3 className="font-semibold">{info.name}</h3>
            {isConnected ? (
              <p className="text-sm text-gray-500">{username}</p>
            ) : (
              <p className="text-sm text-gray-400">연결되지 않음</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="text-green-600 text-sm">✅ 연결됨</span>
              <Button variant="secondary" onClick={onDisconnect}>
                연결 해제
              </Button>
            </>
          ) : (
            <Button onClick={onConnect}>
              연결하기
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
```

---

## 파일 업로드 에러 UI

```typescript
// components/dashboard/upload-error.tsx
interface UploadErrorProps {
  error: {
    type: "format" | "size" | "duration" | "corrupt" | "empty"
    message: string
    detail?: string
  }
  onRetry: () => void
}

export function UploadError({ error, onRetry }: UploadErrorProps) {
  const tips = {
    format: "MP4, MOV, WebM 형식의 영상을 사용해주세요.",
    size: "영상 편집 앱에서 화질을 낮추거나 길이를 줄여보세요.",
    duration: "영상 편집 앱에서 3분 이내로 잘라주세요.",
    corrupt: "다른 영상 파일로 시도해보세요.",
    empty: "파일을 선택해주세요.",
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-medium text-red-800">
            업로드할 수 없는 파일입니다
          </h4>
          <p className="text-red-600 mt-1">{error.message}</p>
          {error.detail && (
            <p className="text-red-500 text-sm mt-1">{error.detail}</p>
          )}
          <p className="text-gray-600 text-sm mt-2">
            💡 Tip: {tips[error.type]}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onRetry}>
          다른 파일 선택
        </Button>
      </div>
    </div>
  )
}
```

---

## 반응형 패턴

```tsx
// 모바일 우선, 점진적 확대
className="
  w-full              // 모바일: 전체 너비
  md:w-1/2            // 태블릿: 절반
  lg:w-1/3            // 데스크톱: 1/3
"

// 그리드
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// 숨기기/보이기
className="hidden md:block"  // 모바일에서 숨김
className="block md:hidden"  // 모바일에서만 표시
```
