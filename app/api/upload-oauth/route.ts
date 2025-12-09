import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@/lib/supabase/client"
import { Readable } from "stream"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const activityId = formData.get("activityId") as string
    const activityType = formData.get("activityType") as string | null
    const activityDate = formData.get("activityDate") as string
    const activityLocation = formData.get("activityLocation") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to stream
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const stream = Readable.from(buffer)

    // Initialize Google Drive with user's OAuth token
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Create folder if it doesn't exist
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!folderId) {
      // Search for existing folder
      const folderSearch = await drive.files.list({
        q: "name='Govardhan Gallery' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id, name)",
      })

      if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        folderId = folderSearch.data.files[0].id!
      } else {
        // Create new folder
        const folderResponse = await drive.files.create({
          requestBody: {
            name: "Govardhan Gallery",
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id",
        })
        folderId = folderResponse.data.id!
      }
    }

    // Upload file
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    })

    const fileId = driveResponse.data.id

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`

    // Save to Supabase
    const supabase = createClient()
    
    let finalActivityId = activityId
    let activityTypeToUse = "google_drive_image_upload"
    
    // Determine the activity type to use
    if (activityId === "manual" && activityType) {
      // Manual entry with custom activity type
      activityTypeToUse = activityType
    } else if (activityId !== "all" && activityId !== "manual") {
      // Check if it's a predefined activity type (not an existing activity ID)
      const predefinedTypes = [
        "Langar", "Annakshetra", "Village Seva", "Disaster Relief",
        "Annadaan Seva (100 people)", "Annadaan Seva (200 people)", 
        "Annadaan Seva (500 people)", "Janmashtami Annadaan Part Seva",
        "Sri Sri Radha Vrindaban Behari Dress", "Maha Aarati Seva",
        "Festival Garland Seva", "Festival Bhoga Seva", "Maha Abhishek Seva",
        "Festival Decoration", "Giriraj Ji Full day Seva", "Halwa Distribution",
        "Green grass for all cows", "Fodder for all cows"
      ]
      
      if (predefinedTypes.includes(activityId)) {
        activityTypeToUse = activityId
      } else {
        // It's an existing activity ID, use it directly
        finalActivityId = activityId
        const { data, error } = await supabase
          .from("media")
          .insert({
            activity_id: finalActivityId,
            media_url: fileUrl,
            media_type: file.type.startsWith("image/") ? "image" : "video",
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ success: true, data, fileUrl })
      }
    }
    
    // Create a new activity entry for "all", "manual", or predefined types
    const { data: newActivity, error: activityError } = await supabase
      .from("activities")
      .insert({
        date: activityDate || new Date().toISOString().split('T')[0],
        activity_type: activityTypeToUse,
        location: activityLocation || "kolkata",
        people_served: 0,
        villages_helped: 0,
        volunteers_count: 0,
        cost_per_plate: null,
        notes: "Image uploaded via gallery"
      })
      .select()
      .single()
    
    if (activityError) throw activityError
    finalActivityId = newActivity.id
    
    const { data, error } = await supabase
      .from("media")
      .insert({
        activity_id: finalActivityId,
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
