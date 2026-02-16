"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X, FileVideo, Loader2 } from "lucide-react"
import { validateVideoFile } from "@/lib/validators"
import { formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { ConnectionInfo } from "@/types"

interface UploadFormProps {
  connections: ConnectionInfo[]
}

export function UploadForm({ connections }: UploadFormProps) {
  // hooks
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())

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

  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(platform)) {
        next.delete(platform)
      } else {
        next.add(platform)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title.trim()) return

    if (selectedPlatforms.size === 0) {
      setError("업로드할 플랫폼을 하나 이상 선택해주세요.")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("platforms", JSON.stringify(Array.from(selectedPlatforms)))

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
      setTitle("")
      setDescription("")
      setSelectedPlatforms(new Set())
    } catch (err) {
      const message = err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다."
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const canSubmit = file && title.trim() && selectedPlatforms.size > 0 && !isUploading

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

      {/* Title */}
      <Card>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="video-title"
              className="block text-sm font-medium text-gray-700"
            >
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="영상 제목을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              required
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="video-description"
              className="block text-sm font-medium text-gray-700"
            >
              설명 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="영상에 대한 설명을 입력하세요"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900"
              disabled={isUploading}
            />
          </div>
        </div>
      </Card>

      {/* Platform selection */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          업로드할 플랫폼
        </label>

        <div className="space-y-3">
          {/* YouTube */}
          <label
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
              youtubeConnection
                ? "cursor-pointer hover:bg-gray-50"
                : "opacity-50 cursor-not-allowed"
            } ${
              selectedPlatforms.has("youtube")
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedPlatforms.has("youtube")}
                onChange={() => handleTogglePlatform("youtube")}
                disabled={!youtubeConnection || isUploading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg">🔴</span>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  YouTube Shorts
                </span>
                {youtubeConnection ? (
                  <p className="text-xs text-gray-500">
                    {youtubeConnection.platformUsername || "연결됨"}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">연결 필요</p>
                )}
              </div>
            </div>
            {youtubeConnection ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                연결됨
              </span>
            ) : (
              <span className="text-xs text-gray-400">미연결</span>
            )}
          </label>

          {/* Instagram */}
          <label
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
              instagramConnection
                ? "cursor-pointer hover:bg-gray-50"
                : "opacity-50 cursor-not-allowed"
            } ${
              selectedPlatforms.has("instagram")
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedPlatforms.has("instagram")}
                onChange={() => handleTogglePlatform("instagram")}
                disabled={!instagramConnection || isUploading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg">📷</span>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Instagram Reels
                </span>
                {instagramConnection ? (
                  <p className="text-xs text-gray-500">
                    {instagramConnection.platformUsername || "연결됨"}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">연결 필요</p>
                )}
              </div>
            </div>
            {instagramConnection ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                연결됨
              </span>
            ) : (
              <span className="text-xs text-gray-400">미연결</span>
            )}
          </label>
        </div>

        {!youtubeConnection && !instagramConnection && (
          <p className="mt-3 text-sm text-gray-500">
            영상을 업로드하려면 먼저{" "}
            <a href="/dashboard/connections" className="text-blue-600 hover:underline">
              플랫폼을 연결
            </a>
            해주세요.
          </p>
        )}
      </Card>

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
