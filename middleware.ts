// 미들웨어 — /dashboard/* 경로 보호 (NextAuth withAuth)
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login" },
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
