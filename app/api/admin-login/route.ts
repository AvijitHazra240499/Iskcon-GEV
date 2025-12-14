import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get credentials from environment variables (server-side only)
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials not configured in environment variables")
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Validate credentials
    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    )
  }
}
