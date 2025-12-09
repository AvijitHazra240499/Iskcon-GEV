"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { signIn, signOut, useSession } from "next-auth/react"

// Extract Google Drive file ID from URL
function extractGoogleDriveFileId(url: string): string | null {
  if (!url || !url.includes("drive.google.com")) return null
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/\/file\/d\/([^\/]+)/)
  if (match1) return match1[1]
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([^&]+)/)
  if (match2) return match2[1]
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  const match3 = url.match(/\/uc\?id=([^&]+)/)
  if (match3) return match3[1]
  
  return null
}

interface MediaItem {
  id: string
  activity_id: string
  media_url: string
  media_type: string
  uploaded_at: string
}

interface Activity {
  id: string
  date: string
  location: string
  activity_type: string
}

export default function GalleryPage() {
  const { data: session } = useSession()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [activities, setActivities] = useState<Record<string, Activity>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedActivityId, setSelectedActivityId] = useState<string>("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showManualType, setShowManualType] = useState(false)
  const [manualActivityType, setManualActivityType] = useState("")
  const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [activityLocation, setActivityLocation] = useState<string>("kolkata")

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    try {
      const supabase = createClient()

      // Load media
      const { data: mediaData, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .order("uploaded_at", { ascending: false })

      if (mediaError) {
        console.error("Error loading media:", mediaError)
        throw mediaError
      }
      setMedia(mediaData || [])

      // Load activities for mapping
      const { data: activitiesData, error: activError } = await supabase
        .from("activities")
        .select("id, date, location, activity_type")

      if (activError) {
        console.error("Error loading activities:", activError)
        throw activError
      }

      const activityMap = (activitiesData || []).reduce((acc: Record<string, Activity>, activity) => {
        acc[activity.id] = activity
        return acc
      }, {})
      setActivities(activityMap)
    } catch (err) {
      console.error("Error loading gallery:", err)
      // Set empty data to prevent UI issues
      setMedia([])
      setActivities({})
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      alert("Please select a file")
      return
    }

    if (selectedActivityId === "manual" && !manualActivityType.trim()) {
      alert("Please enter a custom activity type")
      return
    }

    if (!activityLocation.trim()) {
      alert("Please enter a location")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("activityDate", activityDate)
      formData.append("activityLocation", activityLocation.trim())
      
      // If manual entry, send the custom activity type
      if (selectedActivityId === "manual") {
        formData.append("activityId", "manual")
        formData.append("activityType", manualActivityType.trim())
      } else {
        formData.append("activityId", selectedActivityId || "all")
      }

      const response = await fetch("/api/upload-oauth", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      alert("Upload successful!")
      setShowUploadForm(false)
      setSelectedFile(null)
      setSelectedActivityId("all")
      setManualActivityType("")
      setShowManualType(false)
      setActivityDate(new Date().toISOString().split('T')[0])
      setActivityLocation("kolkata")
      loadGallery() // Reload gallery
    } catch (error) {
      console.error("Upload error:", error)
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(mediaId: string, mediaUrl: string) {
    if (!confirm("Are you sure you want to delete this image? It will be removed from both the gallery and Google Drive.")) {
      return
    }

    setDeleting(mediaId)
    try {
      const response = await fetch("/api/delete-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, mediaUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Delete failed")
      }

      alert("Image deleted successfully!")
      loadGallery() // Reload gallery
    } catch (error) {
      console.error("Delete error:", error)
      alert(`Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🖼️</div>
          <div className="text-cream text-2xl font-bold">Loading Gallery...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-gradient-to-r from-[#FF6B35] via-[#B4D700] to-[#1E3A8A] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-govardhan-circle.png"
                  alt="Govardhan Annakshetra"
                  className="w-12 h-12 rounded-full border-2 border-[#B4D700] shadow-lg"
                />
                <span className="text-white font-bold text-xl">Govardhan Annakshetra</span>
              </div>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-cream hover:text-[#FF6B35] transition font-medium">
                Home
              </Link>
              <Link href="/impact" className="text-cream hover:text-[#B4D700] transition font-medium">
                Impact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#B4D700] mb-4">
            Seva Activities Gallery
          </h1>
          <p className="text-cream/80 text-lg">Visual proof of our divine service across locations and dates</p>
          
          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="mt-6 bg-gradient-to-r from-[#FF6B35] to-[#9333EA] text-white px-8 py-3 rounded-lg font-bold hover:shadow-xl hover:scale-105 transition"
            >
              🔐 Sign in with Google to Upload
            </button>
          ) : (
            <div className="mt-6 flex gap-4 items-center justify-center">
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-gradient-to-r from-[#FF6B35] to-[#9333EA] text-white px-8 py-3 rounded-lg font-bold hover:shadow-xl hover:scale-105 transition"
              >
                {showUploadForm ? "✕ Close Upload" : "📤 Upload Image"}
              </button>
              <button
                onClick={() => signOut()}
                className="bg-gradient-to-r from-[#4A3F33] to-[#3A2F25] text-cream px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition border-2 border-[#B4D700]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#FF6B35] p-8 mb-12 rounded-2xl shadow-xl">
            <h2 className="text-cream font-bold text-2xl mb-6">Upload New Image</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-cream font-semibold mb-2 block">Activity Type</label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedActivityId(value)
                    setShowManualType(value === "manual")
                    if (value !== "manual") {
                      setManualActivityType("")
                    }
                  }}
                  className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="all">All Activities</option>
                  <option value="manual">✏️ Manual Entry (Type Custom)</option>
                  <option value="Langar">Langar</option>
                  <option value="Annakshetra">Annakshetra</option>
                  <option value="Village Seva">Village Seva</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <optgroup label="Annadaan Seva">
                    <option value="Annadaan Seva (100 people)">Annadaan Seva (100 people)</option>
                    <option value="Annadaan Seva (200 people)">Annadaan Seva (200 people)</option>
                    <option value="Annadaan Seva (500 people)">Annadaan Seva (500 people)</option>
                    <option value="Janmashtami Annadaan Part Seva">Janmashtami Annadaan Part Seva</option>
                  </optgroup>
                  <optgroup label="Temple Seva">
                    <option value="Sri Sri Radha Vrindaban Behari Dress">Sri Sri Radha Vrindaban Behari Dress</option>
                    <option value="Maha Aarati Seva">Maha Aarati Seva</option>
                    <option value="Festival Garland Seva">Festival Garland Seva</option>
                    <option value="Festival Bhoga Seva">Festival Bhoga Seva</option>
                    <option value="Maha Abhishek Seva">Maha Abhishek Seva</option>
                    <option value="Festival Decoration">Festival Decoration</option>
                    <option value="Giriraj Ji Full day Seva">Giriraj Ji Full day Seva</option>
                  </optgroup>
                  <optgroup label="Prasadam Distribution">
                    <option value="Halwa Distribution">Halwa Distribution</option>
                  </optgroup>
                  <optgroup label="Gau Seva">
                    <option value="Green grass for all cows">Green grass for all cows</option>
                    <option value="Fodder for all cows">Fodder for all cows</option>
                  </optgroup>
                </select>
              </div>

              {/* Manual Type Input */}
              {showManualType && (
                <div>
                  <label className="text-cream font-semibold mb-2 block">Enter Custom Activity Type</label>
                  <input
                    type="text"
                    value={manualActivityType}
                    onChange={(e) => setManualActivityType(e.target.value)}
                    className="w-full bg-[#2B2015] text-cream border-2 border-[#FF6B35] rounded-lg px-4 py-3 focus:outline-none focus:border-[#B4D700]"
                    placeholder="e.g., Special Event, Custom Seva"
                  />
                </div>
              )}

              <div>
                <label className="text-cream font-semibold mb-2 block">Activity Date</label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="text-cream font-semibold mb-2 block">Location</label>
                <input
                  type="text"
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B35]"
                  placeholder="e.g., Kolkata, Mumbai, Delhi"
                />
              </div>

              <div>
                <label className="text-cream font-semibold mb-2 block">Select Image/Video</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#2B2015] text-cream border-2 border-[#B4D700] rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#B4D700] file:text-[#2B2015] file:font-semibold hover:file:bg-[#6B8C0A] file:cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-cream/60 text-sm mt-2">Selected: {selectedFile.name}</p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] px-8 py-4 rounded-lg font-bold hover:shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading ? "⏳ Uploading..." : "✓ Upload to Gallery"}
              </button>
            </div>
          </Card>
        )}

        {media.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#B4D700] p-16 text-center rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-cream text-lg font-semibold">
              No media uploaded yet. Admin can upload photos/videos from the dashboard.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {media.map((item) => {
              const activity = activities[item.activity_id]
              const date = activity ? new Date(activity.date).toLocaleDateString() : "Unknown Date"
              const location = activity?.location || "Unknown Location"
              const actType = activity?.activity_type || "Activity"

              const typeColor =
                actType === "Langar"
                  ? "from-[#FF6B35] to-[#FF8C42]"
                  : actType === "Annakshetra"
                    ? "from-[#B4D700] to-[#6B8C0A]"
                    : "from-[#1E3A8A] to-[#1E40AF]"

              return (
                <Card
                  key={item.id}
                  className={`bg-gradient-to-br ${typeColor} border-0 overflow-hidden hover:shadow-2xl hover:scale-105 transition rounded-xl transform-gpu`}
                >
                  <div className="relative h-64 bg-[#2B2015] flex items-center justify-center overflow-hidden group">
                    {item.media_type === "image" ? (
                      (() => {
                        const fileId = extractGoogleDriveFileId(item.media_url)
                        if (fileId) {
                          // Use iframe embed for Google Drive
                          return (
                            <iframe
                              src={`https://drive.google.com/file/d/${fileId}/preview`}
                              className="w-full h-full border-0"
                              allow="autoplay"
                              title={`Seva at ${location}`}
                            />
                          )
                        }
                        // Regular image URL
                        return (
                          <img
                            src={item.media_url || "/placeholder.svg"}
                            alt={`Seva at ${location}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        )
                      })()
                    ) : (
                      <video src={item.media_url} controls className="w-full h-full object-cover" />
                    )}
                    
                    {/* Delete button - only show when signed in */}
                    {session && (
                      <button
                        onClick={() => handleDelete(item.id, item.media_url)}
                        disabled={deleting === item.id}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete image"
                      >
                        {deleting === item.id ? (
                          <span className="text-sm">⏳</span>
                        ) : (
                          <span className="text-sm">🗑️</span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-6 bg-[#2B2015]">
                    <p className="text-white font-bold text-sm mb-2 px-3 py-1 bg-black/30 rounded-full w-fit">
                      {actType}
                    </p>
                    <p className="text-cream font-bold mb-1 text-lg">{location}</p>
                    <p className="text-cream/60 text-sm">📅 {date}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
