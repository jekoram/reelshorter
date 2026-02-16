import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            로그인
          </h1>
          <p className="text-white/50 text-center text-sm mb-6">
            ReelShorter에 오신 것을 환영합니다
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
