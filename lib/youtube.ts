import { google } from "googleapis"
import { Readable } from "stream"
import { prisma } from "./prisma"
import { encrypt, decrypt } from "./encryption"

// OAuth 클라이언트 생성
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
}

// 유저의 YouTube 클라이언트 가져오기 (토큰 갱신 포함)
export async function getYouTubeClient(userId: string) {
  const connection = await prisma.connection.findUnique({
    where: { userId_platform: { userId, platform: "youtube" } },
  })

  if (!connection || !connection.isActive) {
    throw new Error("YouTube 연결이 필요합니다.")
  }

  const oauth2Client = createOAuth2Client()
  const accessToken = decrypt(connection.encryptedAccessToken)
  const refreshToken = connection.encryptedRefreshToken
    ? decrypt(connection.encryptedRefreshToken)
    : undefined

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  // 토큰 만료 확인 & 갱신
  const isExpired = connection.tokenExpiresAt && new Date() > connection.tokenExpiresAt

  if (isExpired && refreshToken) {
    const { credentials } = await oauth2Client.refreshAccessToken()

    await prisma.connection.update({
      where: { id: connection.id },
      data: {
        encryptedAccessToken: encrypt(credentials.access_token!),
        tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    })

    oauth2Client.setCredentials(credentials)
  }

  return google.youtube({ version: "v3", auth: oauth2Client })
}

// 영상 업로드
export interface UploadOptions {
  title: string
  description: string
  file: Buffer
  mimeType: string
}

export async function uploadToYouTube(userId: string, options: UploadOptions) {
  const youtube = await getYouTubeClient(userId)

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: options.title,
        description: options.description,
        categoryId: "22",  // People & Blogs
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType: options.mimeType,
      body: Readable.from(options.file),
    },
  })

  return {
    videoId: response.data.id,
    url: `https://youtube.com/shorts/${response.data.id}`,
  }
}
