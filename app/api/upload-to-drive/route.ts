import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@/lib/supabase/client"
import { Readable } from "stream"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const activityId = formData.get("activityId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer and then to stream
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const stream = Readable.from(buffer)

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Upload to Google Drive (Shared Drive)
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    })

    const fileId = driveResponse.data.id

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    })

    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`

    // Save to Supabase
    const supabase = createClient()
    const { data, error } = await supabase
      .from("media")
      .insert({
        activity_id: activityId,
        media_url: fileUrl,
        media_type: file.type.startsWith("image/") ? "image" : "video",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data, fileUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
