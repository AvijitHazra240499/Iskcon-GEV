import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@/lib/supabase/client"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { mediaId, mediaUrl } = await request.json()

    if (!mediaId || !mediaUrl) {
      return NextResponse.json({ error: "Missing mediaId or mediaUrl" }, { status: 400 })
    }

    // Extract Google Drive file ID from URL
    const fileIdMatch = mediaUrl.match(/\/file\/d\/([^\/]+)/)
    const fileId = fileIdMatch ? fileIdMatch[1] : null

    if (fileId) {
      // Initialize Google Drive with user's OAuth token
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: session.accessToken,
      })

      const drive = google.drive({ version: "v3", auth: oauth2Client })

      // Delete file from Google Drive
      try {
        await drive.files.delete({
          fileId: fileId,
        })
      } catch (driveError) {
        console.error("Error deleting from Google Drive:", driveError)
        // Continue even if Drive deletion fails
      }
    }

    // Delete from Supabase
    const supabase = createClient()
    const { error } = await supabase
      .from("media")
      .delete()
      .eq("id", mediaId)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Media deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete media", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
