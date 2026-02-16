export type Platform = "youtube" | "instagram"

export type PublishStatus = "success" | "failed" | "pending"

export interface UploadState {
  file: File | null
  title: string
  description: string
  isUploading: boolean
  progress: number
  error: string | null
}

export interface ConnectionInfo {
  id: string
  platform: Platform
  platformUsername: string | null
  isActive: boolean
}

export interface PublishLogEntry {
  id: string
  platform: Platform
  videoTitle: string
  status: PublishStatus
  errorMessage: string | null
  platformUrl: string | null
  publishedAt: string
}
