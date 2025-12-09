import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const activityId = formData.get("activityId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split(".").pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `gallery/${fileName}`

    // Upload to Supabase Storage
    const supabase = createClient()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath)

    // Save to database
    const { data, error } = await supabase
      .from("media")
      .insert({
        activity_id: activityId,
        media_url: urlData.publicUrl,
        media_type: file.type.startsWith("image/") ? "image" : "video",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data, fileUrl: urlData.publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
