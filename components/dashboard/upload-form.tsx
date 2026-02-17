"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X, FileVideo, Loader2 } from "lucide-react"
import { validateVideoFile } from "@/lib/validators"
import { formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlatformBlock } from "@/components/dashboard/platform-block"
import type { ConnectionInfo } from "@/types"

interface UploadFormProps {
  connections: ConnectionInfo[]
}

interface PlatformInput {
  enabled: boolean
  title: string
  description: string
}

export function UploadForm({ connections }: UploadFormProps) {
  // hooks
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [youtube, setYoutube] = useState<PlatformInput>({
    enabled: false,
    title: "",
    description: "",
  })
  const [instagram, setInstagram] = useState<PlatformInput>({
    enabled: false,
    title: "",
    description: "",
  })

  const youtubeConnection = connections.find((c) => c.platform === "youtube" && c.isActive)
  const instagramConnection = connections.find((c) => c.platform === "instagram" && c.isActive)

  // handlers
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      setSuccessMessage(null)

      const selected = acceptedFiles[0]
      if (!selected) return

      const result = await validateVideoFile(selected)
      if (!result.valid && result.error) {
        setError(result.error.message)
        return
      }

      setFile(selected)
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
  }

  const hasSelectedPlatform = youtube.enabled || instagram.enabled
  const hasTitle =
    (youtube.enabled && youtube.title.trim()) ||
    (instagram.enabled && instagram.title.trim())

  const canSubmit = file && hasSelectedPlatform && hasTitle && !isUploading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return

    if (!hasSelectedPlatform) {
      setError("업로드할 플랫폼을 하나 이상 선택해주세요.")
      return
    }

    // 활성화된 플랫폼의 제목 검증
    if (youtube.enabled && !youtube.title.trim()) {
      setError("YouTube 제목을 입력해주세요.")
      return
    }
    if (instagram.enabled && !instagram.title.trim()) {
      setError("Instagram 제목을 입력해주세요.")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const platforms: { platform: string; title: string; description: string }[] = []

      if (youtube.enabled) {
        platforms.push({
          platform: "youtube",
          title: youtube.title.trim(),
          description: youtube.description.trim(),
        })
      }
      if (instagram.enabled) {
        platforms.push({
          platform: "instagram",
          title: instagram.title.trim(),
          description: instagram.description.trim(),
        })
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("platforms", JSON.stringify(platforms))

      const response = await fetch("/api/publish", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "업로드에 실패했습니다.")
      }

      setSuccessMessage("영상이 성공적으로 업로드되었습니다!")
      setFile(null)
      setYoutube({ enabled: false, title: "", description: "" })
      setInstagram({ enabled: false, title: "", description: "" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다."
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* File drop zone */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          영상 파일
        </label>

        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">파일을 여기에 놓으세요</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  클릭하거나 파일을 드래그해서 업로드
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  MP4, MOV, WebM (최대 499MB, 3분 이내)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileVideo className="h-8 w-8 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="파일 제거"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </Card>

      {/* YouTube Block */}
      <PlatformBlock
        platform="youtube"
        isConnected={!!youtubeConnection}
        enabled={youtube.enabled}
        onToggle={(checked) => setYoutube((prev) => ({ ...prev, enabled: checked }))}
        title={youtube.title}
        onTitleChange={(value) => setYoutube((prev) => ({ ...prev, title: value }))}
        description={youtube.description}
        onDescriptionChange={(value) => setYoutube((prev) => ({ ...prev, description: value }))}
        disabled={isUploading}
      />

      {/* Instagram Block */}
      <PlatformBlock
        platform="instagram"
        isConnected={!!instagramConnection}
        enabled={instagram.enabled}
        onToggle={(checked) => setInstagram((prev) => ({ ...prev, enabled: checked }))}
        title={instagram.title}
        onTitleChange={(value) => setInstagram((prev) => ({ ...prev, title: value }))}
        description={instagram.description}
        onDescriptionChange={(value) => setInstagram((prev) => ({ ...prev, description: value }))}
        disabled={isUploading}
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={!canSubmit}
        isLoading={isUploading}
        className="w-full py-3"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            업로드 중...
          </span>
        ) : (
          "업로드"
        )}
      </Button>
    </form>
  )
}
