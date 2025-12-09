"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface MediaUploadProps {
  activityId: string
  onSuccess: () => void
}

export default function MediaUpload({ activityId, onSuccess }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [useUrl, setUseUrl] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMediaType(selectedFile.type.startsWith("video") ? "video" : "image")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage("Please select a file")
      return
    }

    setUploading(true)
    setMessage("")

    try {
      // In a real app, you'd upload to Vercel Blob or similar
      // For now, we'll store a placeholder URL
      const reader = new FileReader()
      reader.onload = async (event) => {
        const supabase = createClient()
        const mediaUrl = event.target?.result as string

        const { error } = await supabase.from("media").insert([
          {
            activity_id: activityId,
            media_url: mediaUrl,
            media_type: mediaType,
          },
        ])

        if (error) throw error
        setMessage("Media uploaded successfully!")
        setFile(null)
        setTimeout(() => onSuccess(), 1000)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!urlInput) {
      setMessage("Please enter a URL")
      return
    }

    setUploading(true)
    setMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.from("media").insert([
        {
          activity_id: activityId,
          media_url: urlInput,
          media_type: mediaType,
        },
      ])

      if (error) throw error
      setMessage("Media URL saved successfully!")
      setUrlInput("")
      setTimeout(() => onSuccess(), 1000)
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`flex-1 ${!useUrl ? "bg-[#B4D700] text-[#2B2015]" : "bg-[#4A3F33] text-cream"}`}
        >
          Upload File
        </Button>
        <Button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`flex-1 ${useUrl ? "bg-[#B4D700] text-[#2B2015]" : "bg-[#4A3F33] text-cream"}`}
        >
          Use URL
        </Button>
      </div>

      {useUrl ? (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-cream font-semibold mb-2">Google Drive Image URL</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
              className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded px-4 py-2"
            />
            <p className="text-cream/60 text-xs mt-2">
              📌 Tip: Right-click image in Google Drive → Get link → Make sure it's set to "Anyone with the link can
              view"
            </p>
          </div>

          <div>
            <label className="block text-cream font-semibold mb-2">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "image" | "video")}
              className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded px-4 py-2"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded text-sm ${message.includes("Error") ? "text-red-400" : "text-[#B4D700]"}`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !urlInput}
            className="w-full bg-[#B4D700] text-[#2B2015] hover:bg-[#9BC700] font-bold"
          >
            {uploading ? "SAVING..." : "SAVE URL"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cream font-semibold mb-2">Upload Proof Photo/Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded px-4 py-2"
            />
            {file && <p className="text-[#B4D700] text-sm mt-2">Selected: {file.name}</p>}
            <p className="text-cream/60 text-xs mt-2">⚠️ Note: Files are stored as base64 (not recommended for production)</p>
          </div>

          {message && (
            <div className={`p-3 rounded text-sm ${message.includes("Error") ? "text-red-400" : "text-[#B4D700]"}`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-[#B4D700] text-[#2B2015] hover:bg-[#9BC700] font-bold"
          >
            {uploading ? "UPLOADING..." : "UPLOAD MEDIA"}
          </Button>
        </form>
      )}
    </div>
  )
}
