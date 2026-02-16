# Auth Context - app/(auth)/claude.md

> 회원가입, 로그인, 세션 관리 작업 시 참조
> 이 파일은 `app/(auth)/claude.md`에 저장

---

## 인증 방식

```
1. 이메일/비밀번호 (Credentials)
2. 구글 로그인 (OAuth) - 선택사항
```

NextAuth.js v5 사용

---

## 이 폴더 구조

```
app/(auth)/
├── claude.md           ← 이 파일
├── login/
│   └── page.tsx        # /login
└── signup/
    └── page.tsx        # /signup
```

---

## 관련 파일

```
lib/auth.ts                     # NextAuth 설정
actions/auth.ts                 # 회원가입 Server Action
middleware.ts                   # 보호 라우트
components/auth/login-form.tsx  # 로그인 폼
components/auth/signup-form.tsx # 회원가입 폼
types/next-auth.d.ts            # 세션 타입 확장
```

---

## NextAuth 설정 템플릿

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("등록되지 않은 이메일입니다.")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("비밀번호가 일치하지 않습니다.")
        }

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}
```

---

## 회원가입 Server Action

```typescript
// actions/auth.ts
"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password) {
    return { success: false, error: "이메일과 비밀번호를 입력해주세요." }
  }

  if (password.length < 8) {
    return { success: false, error: "비밀번호는 8자 이상이어야 합니다." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "이미 가입된 이메일입니다." }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  return { success: true }
}
```

---

## 로그인 페이지 템플릿

```typescript
// app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <LoginForm />
      </div>
    </div>
  )
}
```

---

## 미들웨어 (보호 라우트)

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login" },
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

---

## 세션 타입 확장

```typescript
// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"]
  }
}
```

---

## 에러 메시지

| 상황 | 메시지 |
|------|--------|
| 빈 입력 | "이메일과 비밀번호를 입력해주세요." |
| 이메일 형식 | "올바른 이메일 형식이 아닙니다." |
| 비밀번호 짧음 | "비밀번호는 8자 이상이어야 합니다." |
| 이메일 중복 | "이미 가입된 이메일입니다." |
| 미가입 | "등록되지 않은 이메일입니다." |
| 비밀번호 불일치 | "비밀번호가 일치하지 않습니다." |
