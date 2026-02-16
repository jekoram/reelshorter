import type { Metadata } from "next"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "ReelShorter - Upload Once, Share Everywhere",
  description: "Instantly publish your videos to YouTube Shorts & Instagram Reels",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
