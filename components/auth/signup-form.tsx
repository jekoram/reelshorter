"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { signup } from "@/actions/auth"

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)

      const result = await signup(formData)

      if (!result.success) {
        setError(result.error ?? "회원가입 중 오류가 발생했습니다.")
        return
      }

      // Auto-login after successful signup
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Signup succeeded but auto-login failed; redirect to login page
        router.push("/login")
      } else if (signInResult?.ok) {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      console.error("Signup failed:", err)
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
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
        label="이름"
        type="text"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        disabled={isLoading}
      />

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
        placeholder="8자 이상 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Input
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-accent-red to-accent-orange text-white font-bold uppercase tracking-wider px-8 py-3 rounded-full hover:brightness-110 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100"
      >
        {isLoading ? "가입 중..." : "회원가입"}
      </button>

      <p className="text-center text-sm text-white/50">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-accent-red hover:text-accent-orange transition-colors font-medium"
        >
          로그인
        </Link>
      </p>
    </form>
  )
}
