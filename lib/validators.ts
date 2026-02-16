export const FILE_CONSTRAINTS = {
  maxSize: 499 * 1024 * 1024,
  maxDuration: 180,
  allowedTypes: ["video/mp4", "video/quicktime", "video/webm"],
  allowedExtensions: [".mp4", ".mov", ".webm"],
}

export interface ValidationError {
  type: "format" | "size" | "duration" | "corrupt" | "empty"
  message: string
  detail?: string
}

export interface ValidationResult {
  valid: boolean
  error?: ValidationError
}

export function validateFileType(file: File): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: {
        type: "empty",
        message: "업로드할 파일을 선택해주세요.",
      },
    }
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(file.type)
  const isValidExt = FILE_CONSTRAINTS.allowedExtensions.includes(ext)

  if (!isValidType && !isValidExt) {
    return {
      valid: false,
      error: {
        type: "format",
        message: "지원하지 않는 파일 형식입니다. MP4, MOV, WebM 파일만 업로드할 수 있어요.",
      },
    }
  }

  return { valid: true }
}

export function validateFileSize(file: File): ValidationResult {
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    const sizeMB = Math.round(file.size / 1024 / 1024)
    return {
      valid: false,
      error: {
        type: "size",
        message: "파일 크기가 너무 큽니다. 최대 499MB까지 업로드할 수 있어요.",
        detail: `현재: ${sizeMB}MB`,
      },
    }
  }

  return { valid: true }
}

export function validateVideoDuration(duration: number): ValidationResult {
  if (duration > FILE_CONSTRAINTS.maxDuration) {
    return {
      valid: false,
      error: {
        type: "duration",
        message: "영상이 너무 깁니다. 최대 3분(180초)까지 업로드할 수 있어요.",
        detail: `현재: ${Math.round(duration)}초`,
      },
    }
  }

  return { valid: true }
}

export async function validateVideoFile(file: File): Promise<ValidationResult> {
  const typeResult = validateFileType(file)
  if (!typeResult.valid) return typeResult

  const sizeResult = validateFileSize(file)
  if (!sizeResult.valid) return sizeResult

  try {
    const duration = await getVideoDuration(file)
    const durationResult = validateVideoDuration(duration)
    if (!durationResult.valid) return durationResult
  } catch {
    return {
      valid: false,
      error: {
        type: "corrupt",
        message: "파일을 읽을 수 없습니다. 영상 파일이 손상되었거나 올바른 형식이 아닐 수 있어요.",
      },
    }
  }

  return { valid: true }
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error("Failed to load video"))
    }

    video.src = URL.createObjectURL(file)
  })
}
