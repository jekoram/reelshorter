"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      console.error("Login failed:", err)
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-accent-red to-accent-orange text-white font-bold uppercase tracking-wider px-8 py-3 rounded-full hover:brightness-110 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      <p className="text-center text-sm text-white/50">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-accent-red hover:text-accent-orange transition-colors font-medium"
        >
          회원가입
        </Link>
      </p>
    </form>
  )
}
