import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            회원가입
          </h1>
          <p className="text-white/50 text-center text-sm mb-6">
            ReelShorter 계정을 만들어보세요
          </p>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
