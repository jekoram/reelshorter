// Instagram API - Coming Soon (Phase 6)
// Meta 앱 심사 후 구현 예정

export interface InstagramUploadOptions {
  caption: string
  file: Buffer
  mimeType: string
}

export async function uploadToInstagram(
  _userId: string,
  _options: InstagramUploadOptions
): Promise<{ mediaId: string; url: string }> {
  throw new Error("Instagram 업로드는 아직 지원하지 않습니다.")
}
