import fs from "fs"
import path from "path"

interface GoogleClientSecret {
  web: {
    client_id: string
    client_secret: string
    project_id: string
    auth_uri: string
    token_uri: string
    redirect_uris: string[]
  }
}

let cached: { clientId: string; clientSecret: string } | null = null

function loadCredentials(): { clientId: string; clientSecret: string } {
  if (cached) return cached

  // 1. 환경변수 우선 (프로덕션 / Vercel)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    cached = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
    return cached
  }

  // 2. JSON 파일 fallback (로컬 개발)
  try {
    const docsDir = path.join(process.cwd(), "docs")
    const files = fs.readdirSync(docsDir)
    const credFile = files.find(
      (f) => f.startsWith("google_client_secret") && f.endsWith(".json")
    )

    if (credFile) {
      const content = fs.readFileSync(path.join(docsDir, credFile), "utf-8")
      const data = JSON.parse(content) as GoogleClientSecret
      cached = {
        clientId: data.web.client_id,
        clientSecret: data.web.client_secret,
      }
      return cached
    }
  } catch {
    // 파일 읽기 실패 시 아래 에러로 이동
  }

  throw new Error(
    "Google OAuth 자격 증명을 찾을 수 없습니다. " +
    "환경변수(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)를 설정하거나, " +
    "docs/ 폴더에 google_client_secret*.json 파일을 추가해주세요."
  )
}

export function getGoogleClientId(): string {
  return loadCredentials().clientId
}

export function getGoogleClientSecret(): string {
  return loadCredentials().clientSecret
}
