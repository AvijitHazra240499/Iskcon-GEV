"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ActivityForm from "@/components/admin/activity-form"
import ActivityList from "@/components/admin/activity-list"
import DonationsList from "@/components/admin/donations-list"
import QRCode from "qrcode"
import jsQR from "jsqr"

interface Activity {
  id: string
  date: string
  activity_type: string
  location: string
  people_served: number
  villages_helped: number
  volunteers_count: number
  cost_per_plate: number | null
  notes: string
}

interface DonationCampaign {
  id: string
  campaign_name: string
  target_amount: number
  raised_amount: number
  people_helped: number
  status: string
}

// Admin credentials - In production, use environment variables
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "govardhan@2025"

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([])
  const [sevaOpportunities, setSevaOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [campaignForm, setCampaignForm] = useState({
    campaign_name: "",
    target_amount: "",
    raised_amount: "",
    people_helped: "",
  })
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [manualRaisedAmount, setManualRaisedAmount] = useState("")
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null)
  const [editingSevaId, setEditingSevaId] = useState<string | null>(null)
  const [deletingSeva, setDeletingSeva] = useState<string | null>(null)
  const [sevaForm, setSevaForm] = useState({
    name: "",
    description: "",
    unit_price: "",
    total_quantity: "",
    category: "Food Distribution",
  })
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [deletingAllActivities, setDeletingAllActivities] = useState(false)
  const [deletingAllCampaigns, setDeletingAllCampaigns] = useState(false)
  const [deletingAllDonations, setDeletingAllDonations] = useState(false)
  const [deletingAllMedia, setDeletingAllMedia] = useState(false)
  const [showQRSettings, setShowQRSettings] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [qrCodeText, setQrCodeText] = useState<string>("")
  const [uploadingQR, setUploadingQR] = useState(false)
  const [scanningQR, setScanningQR] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  // Check if already logged in (from localStorage)
  useEffect(() => {
    const authToken = localStorage.getItem("admin_auth")
    if (authToken === "authenticated") {
      setIsAuthenticated(true)
    }
    setCheckingAuth(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
      loadQRCode()
    }
  }, [isAuthenticated])

  // Login handler
  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")

    if (loginUsername === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("admin_auth", "authenticated")
      setLoginUsername("")
      setLoginPassword("")
    } else {
      setLoginError("Invalid username or password")
    }
  }

  // Logout handler
  function handleLogout() {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_auth")
  }

  async function loadData() {
    const supabase = createClient()
    
    // Load activities (don't let other errors affect this)
    try {
      console.log("Loading activities from Supabase...")
      const { data: activitiesData, error: activError } = await supabase
        .from("activities")
        .select("*")
        .order("date", { ascending: false })

      if (activError) {
        console.error("Error loading activities:", activError)
        setActivities([])
      } else {
        console.log("Activities loaded:", activitiesData?.length || 0)
        setActivities(activitiesData || [])
      }
    } catch (err) {
      console.error("Error loading activities:", err)
      setActivities([])
    }

    // Load campaigns (independent of activities)
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("donation_campaigns")
        .select("*")
        .order("created_at", { ascending: false })

      if (campaignsError) {
        console.error("Error loading campaigns:", campaignsError)
        setCampaigns([])
      } else {
        setCampaigns(campaignsData || [])
      }
    } catch (err) {
      console.error("Error loading campaigns:", err)
      setCampaigns([])
    }

    setLoading(false)
  }

  async function loadQRCode() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "donation_qr_text")
        .single()

      if (!error && data) {
        setQrCodeText(data.value)
        // Generate QR code from text
        generateQRCode(data.value)
      }
    } catch (err) {
      console.error("Error loading QR code:", err)
    }
  }

  async function generateQRCode(text: string) {
    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(qrDataUrl)
    } catch (err) {
      console.error("Error generating QR code:", err)
    }
  }

  async function handleQRUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanningQR(true)
    try {
      // Read the image file
      const imageData = await readImageFile(file)
      
      // Scan QR code using jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (!code) {
        alert("Failed to scan QR code. Please make sure the image contains a valid QR code.")
        setScanningQR(false)
        return
      }

      const decodedText = code.data
      console.log("Decoded QR text:", decodedText)
      setQrCodeText(decodedText)

      // Generate new QR code from the extracted text
      await generateQRCode(decodedText)

      // Save the text to settings table
      try {
        const supabase = createClient()
        const { error: settingsError } = await supabase
          .from("settings")
          .upsert({ key: "donation_qr_text", value: decodedText }, { onConflict: "key" })

        if (settingsError) {
          console.error("Database error:", settingsError)
          alert("QR Code scanned successfully! But failed to save to database. Please create the 'settings' table.")
        } else {
          alert("QR Code scanned and saved successfully!")
        }
      } catch (dbErr) {
        console.error("Database error:", dbErr)
        alert("QR Code scanned successfully! But failed to save to database. Please create the 'settings' table.")
      }
    } catch (err) {
      console.error("Error scanning QR:", err)
      alert("Failed to scan QR code. Please make sure the image contains a valid QR code.")
    } finally {
      setScanningQR(false)
    }
  }

  // Helper function to read image file and get pixel data
  function readImageFile(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, img.width, img.height)
          resolve(imageData)
        }
        img.onerror = () => reject(new Error("Could not load image"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Could not read file"))
      reader.readAsDataURL(file)
    })
  }

  async function handleManualTextSave() {
    if (!qrCodeText.trim()) {
      alert("Please enter UPI text")
      return
    }

    try {
      // Generate QR code from text
      await generateQRCode(qrCodeText)

      // Save to settings table
      const supabase = createClient()
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert({ key: "donation_qr_text", value: qrCodeText }, { onConflict: "key" })

      if (settingsError) throw settingsError

      alert("QR Code saved successfully!")
    } catch (err) {
      console.error("Error saving QR:", err)
      alert("Failed to save QR code")
    }
  }

  async function removeQRCode() {
    if (!confirm("Are you sure you want to remove the QR code?")) return

    try {
      const supabase = createClient()
      await supabase.from("settings").delete().eq("key", "donation_qr_text")
      setQrCodeUrl("")
      setQrCodeText("")
      alert("QR Code removed successfully!")
    } catch (err) {
      console.error("Error removing QR:", err)
      alert("Failed to remove QR code")
    }
  }

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    console.log("Form success - closing form and reloading data")
    setShowForm(false)
    setEditingActivity(null)
    // Force a fresh load of data
    loadData()
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { error } = await supabase.from("donation_campaigns").insert([
        {
          campaign_name: campaignForm.campaign_name,
          target_amount: Number.parseInt(campaignForm.target_amount),
          raised_amount: Number.parseInt(campaignForm.raised_amount) || 0,
          people_helped: Number.parseInt(campaignForm.people_helped),
          status: "active",
        },
      ])

      if (error) throw error
      setCampaignForm({ campaign_name: "", target_amount: "", raised_amount: "", people_helped: "" })
      setShowCampaignForm(false)
      loadData()
      alert("Campaign created successfully!")
    } catch (err) {
      console.error("Error creating campaign:", err)
      alert("Failed to create campaign")
    }
  }

  async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
    try {
      const supabase = createClient()
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const { error } = await supabase.from("donation_campaigns").update({ status: newStatus }).eq("id", campaignId)

      if (error) throw error
      loadData()
    } catch (err) {
      console.error("Error updating campaign:", err)
    }
  }

  async function updateCampaignRaisedAmount(campaignId: string) {
    try {
      const amount = Number.parseFloat(manualRaisedAmount)
      if (isNaN(amount) || amount < 0) {
        alert("Please enter a valid amount")
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from("donation_campaigns")
        .update({ raised_amount: amount })
        .eq("id", campaignId)

      if (error) throw error
      
      setEditingCampaignId(null)
      setManualRaisedAmount("")
      loadData()
      alert("Campaign raised amount updated successfully!")
    } catch (err) {
      console.error("Error updating raised amount:", err)
      alert("Failed to update raised amount")
    }
  }

  async function deleteCampaign(campaignId: string) {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    setDeletingCampaign(campaignId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("donation_campaigns")
        .delete()
        .eq("id", campaignId)

      if (error) throw error
      
      loadData()
      alert("Campaign deleted successfully!")
    } catch (err) {
      console.error("Error deleting campaign:", err)
      alert("Failed to delete campaign")
    } finally {
      setDeletingCampaign(null)
    }
  }

  async function handleCreateSeva(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      
      if (editingSevaId) {
        // Update existing seva
        const { error } = await supabase
          .from("seva_opportunities")
          .update({
            name: sevaForm.name,
            description: sevaForm.description,
            unit_price: Number.parseInt(sevaForm.unit_price),
            total_quantity: Number.parseInt(sevaForm.total_quantity),
            category: sevaForm.category,
          })
          .eq("id", editingSevaId)

        if (error) throw error
        alert("Seva opportunity updated successfully!")
      } else {
        // Create new seva
        const { error } = await supabase.from("seva_opportunities").insert([
          {
            name: sevaForm.name,
            description: sevaForm.description,
            unit_price: Number.parseInt(sevaForm.unit_price),
            total_quantity: Number.parseInt(sevaForm.total_quantity),
            obtained_quantity: 0,
            category: sevaForm.category,
          },
        ])

        if (error) throw error
        alert("Seva opportunity created successfully!")
      }
      
      setEditingSevaId(null)
      setSevaForm({ name: "", description: "", unit_price: "", total_quantity: "", category: "Food Distribution" })
      loadData()
    } catch (err) {
      console.error("Error with seva opportunity:", err)
      alert("Failed to save seva opportunity")
    }
  }

  async function handleDeleteSeva(sevaId: string) {
    if (!confirm("Are you sure you want to delete this seva opportunity? This action cannot be undone.")) {
      return
    }

    setDeletingSeva(sevaId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("seva_opportunities").delete().eq("id", sevaId)

      if (error) throw error
      loadData()
      alert("Seva opportunity deleted successfully!")
    } catch (err) {
      console.error("Error deleting seva:", err)
      alert("Failed to delete seva opportunity")
    } finally {
      setDeletingSeva(null)
    }
  }

  // Bulk Delete Functions
  async function deleteAllActivities() {
    if (!confirm("⚠️ WARNING: This will DELETE ALL seva activities from the database. This action CANNOT be undone. Are you sure?")) {
      return
    }
    if (!confirm("🚨 FINAL CONFIRMATION: All activity data will be permanently lost. Type 'DELETE' in the next prompt to confirm.")) {
      return
    }
    const confirmText = prompt("Type 'DELETE' to confirm deletion of all activities:")
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled. Text did not match.")
      return
    }

    setDeletingAllActivities(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (error) throw error
      loadData()
      alert("✅ All activities deleted successfully!")
    } catch (err) {
      console.error("Error deleting activities:", err)
      alert("Failed to delete activities")
    } finally {
      setDeletingAllActivities(false)
    }
  }

  async function deleteAllCampaigns() {
    if (!confirm("⚠️ WARNING: This will DELETE ALL donation campaigns from the database. This action CANNOT be undone. Are you sure?")) {
      return
    }
    const confirmText = prompt("Type 'DELETE' to confirm deletion of all campaigns:")
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled. Text did not match.")
      return
    }

    setDeletingAllCampaigns(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("donation_campaigns").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (error) throw error
      loadData()
      alert("✅ All campaigns deleted successfully!")
    } catch (err) {
      console.error("Error deleting campaigns:", err)
      alert("Failed to delete campaigns")
    } finally {
      setDeletingAllCampaigns(false)
    }
  }

  async function deleteAllDonations() {
    if (!confirm("⚠️ WARNING: This will DELETE ALL donation records from the database. This action CANNOT be undone. Are you sure?")) {
      return
    }
    const confirmText = prompt("Type 'DELETE' to confirm deletion of all donations:")
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled. Text did not match.")
      return
    }

    setDeletingAllDonations(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("donations").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (error) throw error
      alert("✅ All donations deleted successfully!")
    } catch (err) {
      console.error("Error deleting donations:", err)
      alert("Failed to delete donations")
    } finally {
      setDeletingAllDonations(false)
    }
  }

  async function deleteAllMedia() {
    if (!confirm("⚠️ WARNING: This will DELETE ALL media/gallery items from the database. This action CANNOT be undone. Are you sure?")) {
      return
    }
    const confirmText = prompt("Type 'DELETE' to confirm deletion of all media:")
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled. Text did not match.")
      return
    }

    setDeletingAllMedia(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("media").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (error) throw error
      alert("✅ All media deleted successfully!")
    } catch (err) {
      console.error("Error deleting media:", err)
      alert("Failed to delete media")
    } finally {
      setDeletingAllMedia(false)
    }
  }

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B4D700] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center px-4">
        <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#B4D700] p-10 shadow-2xl rounded-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/logo-govardhan-circle.png"
              alt="Govardhan Annakshetra"
              className="w-20 h-20 rounded-full border-4 border-[#B4D700] mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/60">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white/80 font-semibold mb-2">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] font-bold py-4 text-lg hover:shadow-xl transition"
            >
              🔐 LOGIN
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#B4D700] hover:text-[#FF6B35] transition font-medium">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-gradient-to-r from-[#FF6B35] via-[#B4D700] to-[#1E3A8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <img
                src="/logo-govardhan-circle.png"
                alt="Govardhan Annakshetra"
                className="w-10 h-10 rounded-full border-2 border-[#B4D700]"
              />
              <span className="text-white font-bold text-xl">Govardhan Annakshetra</span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-white hover:text-[#FF6B35] transition font-medium">
                Home
              </Link>
              <Link href="/impact" className="text-white hover:text-[#B4D700] transition font-medium">
                Impact
              </Link>
              <Link href="/donations" className="text-white hover:text-[#9333EA] transition font-medium">
                Donations
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Tabs for Activities, Campaigns, QR Settings, and Data Management */}
        <div className="flex gap-4 mb-12 border-b-2 border-[#6B5A4A] overflow-x-auto">
          <button
            onClick={() => {
              setShowForm(false)
              setShowCampaignForm(false)
              setShowDataManagement(false)
              setShowQRSettings(false)
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              !showCampaignForm && !showDataManagement && !showQRSettings
                ? "text-[#B4D700] border-b-2 border-[#B4D700]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Seva Activities
          </button>
          <button
            onClick={() => {
              setShowCampaignForm(true)
              setShowForm(false)
              setShowDataManagement(false)
              setShowQRSettings(false)
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              showCampaignForm && !showDataManagement && !showQRSettings
                ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Donation Campaigns
          </button>
          <button
            onClick={() => {
              setShowQRSettings(true)
              setShowCampaignForm(false)
              setShowForm(false)
              setShowDataManagement(false)
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              showQRSettings
                ? "text-[#9333EA] border-b-2 border-[#9333EA]"
                : "text-white/70 hover:text-white"
            }`}
          >
            📱 QR Code Settings
          </button>
          <button
            onClick={() => {
              setShowDataManagement(true)
              setShowCampaignForm(false)
              setShowForm(false)
              setShowQRSettings(false)
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              showDataManagement
                ? "text-red-500 border-b-2 border-red-500"
                : "text-white/70 hover:text-white"
            }`}
          >
            🗑️ Data Management
          </button>
        </div>

        {/* QR Code Settings Section */}
        {showQRSettings && (
          <>
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-white mb-2">📱 QR Code Settings</h1>
              <p className="text-white/70 text-lg">Upload or enter UPI payment details for donations</p>
            </div>



            <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#9333EA] p-10 shadow-2xl rounded-2xl">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Upload/Input Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Option 1: Upload QR Image</h2>
                  <p className="text-white/70 mb-4">
                    Upload your existing UPI QR code image. We'll scan it and extract the payment details automatically.
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRUpload}
                      disabled={scanningQR}
                      className="w-full bg-[#2B2015] text-white border-2 border-[#B4D700] rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#B4D700] file:text-[#2B2015] file:font-semibold hover:file:bg-[#6B8C0A] file:cursor-pointer disabled:opacity-50"
                    />
                    {scanningQR && (
                      <p className="text-[#B4D700] font-semibold">⏳ Scanning QR code...</p>
                    )}
                  </div>

                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Option 2: Enter UPI ID Manually</h2>
                    <p className="text-white/70 mb-4">
                      Or enter your UPI ID/link directly and we'll generate a QR code for you.
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={qrCodeText}
                        onChange={(e) => setQrCodeText(e.target.value)}
                        placeholder="e.g., upi://pay?pa=yourname@upi&pn=YourName"
                        className="w-full bg-[#2B2015] text-white border-2 border-[#B4D700] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                      <Button
                        onClick={handleManualTextSave}
                        className="w-full bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] font-bold py-3"
                      >
                        Generate & Save QR Code
                      </Button>
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <Button
                      onClick={removeQRCode}
                      className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      🗑️ Remove QR Code
                    </Button>
                  )}
                </div>

                {/* Preview Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Generated QR Code</h2>
                  {qrCodeUrl ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl inline-block">
                        <img
                          src={qrCodeUrl}
                          alt="Payment QR Code"
                          className="max-w-[250px] max-h-[250px] object-contain"
                        />
                      </div>
                      {qrCodeText && (
                        <div className="bg-[#2B2015] p-4 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Extracted/Entered UPI Text:</p>
                          <p className="text-[#B4D700] text-sm font-mono break-all">{qrCodeText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#2B2015] border-2 border-dashed border-[#6B5A4A] rounded-xl p-12 text-center">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-white/60">No QR code generated yet</p>
                      <p className="text-white/40 text-sm mt-2">Upload a QR image or enter UPI details</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8 p-6 bg-[#2B2015] rounded-lg border-l-4 border-[#B4D700]">
                <h3 className="text-white font-bold mb-3">💡 How it works</h3>
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• <strong>Option 1:</strong> Upload your existing UPI QR code image - we'll scan and extract the payment link</li>
                  <li>• <strong>Option 2:</strong> Enter your UPI ID manually (e.g., yourname@upi or full UPI link)</li>
                  <li>• A new QR code will be generated from the extracted/entered text</li>
                  <li>• This QR code will be shown on the donations page for users to scan</li>
                </ul>
              </div>
            </Card>
          </>
        )}

        {/* Data Management Section */}
        {showDataManagement && !showQRSettings && (
          <>
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-white mb-2">🗑️ Data Management</h1>
              <p className="text-white/70 text-lg">Delete old data from database to keep it clean</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Delete All Activities */}
              <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-red-500 p-8 shadow-xl rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">📋</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Seva Activities</h3>
                    <p className="text-white/60 text-sm">Total: {activities.length} entries</p>
                  </div>
                </div>
                <p className="text-white/70 mb-6">
                  Delete all seva activity records from the database. This will reset all activity data and charts.
                </p>
                <Button
                  onClick={deleteAllActivities}
                  disabled={deletingAllActivities}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 transition disabled:opacity-50"
                >
                  {deletingAllActivities ? "⏳ DELETING..." : "🗑️ DELETE ALL ACTIVITIES"}
                </Button>
              </Card>

              {/* Delete All Campaigns */}
              <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-red-500 p-8 shadow-xl rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">💝</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Donation Campaigns</h3>
                    <p className="text-white/60 text-sm">Total: {campaigns.length} campaigns</p>
                  </div>
                </div>
                <p className="text-white/70 mb-6">
                  Delete all donation campaign records. This will remove all campaign progress data.
                </p>
                <Button
                  onClick={deleteAllCampaigns}
                  disabled={deletingAllCampaigns}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 transition disabled:opacity-50"
                >
                  {deletingAllCampaigns ? "⏳ DELETING..." : "🗑️ DELETE ALL CAMPAIGNS"}
                </Button>
              </Card>

              {/* Delete All Donations */}
              <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-red-500 p-8 shadow-xl rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">💰</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Donation Records</h3>
                    <p className="text-white/60 text-sm">All payment records</p>
                  </div>
                </div>
                <p className="text-white/70 mb-6">
                  Delete all donation payment records. This will clear the donation history.
                </p>
                <Button
                  onClick={deleteAllDonations}
                  disabled={deletingAllDonations}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 transition disabled:opacity-50"
                >
                  {deletingAllDonations ? "⏳ DELETING..." : "🗑️ DELETE ALL DONATIONS"}
                </Button>
              </Card>

              {/* Delete All Media */}
              <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-red-500 p-8 shadow-xl rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🖼️</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Gallery Media</h3>
                    <p className="text-white/60 text-sm">All images and videos</p>
                  </div>
                </div>
                <p className="text-white/70 mb-6">
                  Delete all media records from gallery. Note: Files on Google Drive won't be deleted.
                </p>
                <Button
                  onClick={deleteAllMedia}
                  disabled={deletingAllMedia}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 transition disabled:opacity-50"
                >
                  {deletingAllMedia ? "⏳ DELETING..." : "🗑️ DELETE ALL MEDIA"}
                </Button>
              </Card>
            </div>

            {/* Warning Notice */}
            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 border-red-500 p-8 mt-8 shadow-xl rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Important Warning</h3>
                  <ul className="text-white/70 space-y-2 text-sm">
                    <li>• All deletions are <span className="text-red-400 font-bold">PERMANENT</span> and cannot be undone</li>
                    <li>• You will be asked to type 'DELETE' to confirm each action</li>
                    <li>• Charts and statistics will be reset after deletion</li>
                    <li>• Consider exporting data before deletion if needed</li>
                    <li>• Use this feature only when you need to clear old/test data</li>
                  </ul>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Activities Section */}
        {!showCampaignForm && !showDataManagement && !showQRSettings && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Seva Activities</h1>
                <p className="text-white/70 text-lg">Record and manage seva activities</p>
              </div>
              <Button
                onClick={() => {
                  setEditingActivity(null)
                  setShowForm(!showForm)
                }}
                className={`${showForm ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:shadow-xl"} text-white font-bold px-8 py-6 text-lg transition hover:scale-105`}
              >
                {showForm ? "✕ CLOSE FORM" : "✚ ADD NEW ACTIVITY"}
              </Button>
            </div>

            {showForm && (
              <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#FF6B35] p-10 mb-16 shadow-2xl rounded-2xl">
                <ActivityForm editingActivity={editingActivity} onSuccess={handleFormSuccess} />
              </Card>
            )}

            <ActivityList activities={activities} loading={loading} onRefresh={loadData} onEdit={handleEditClick} />
          </>
        )}

        {/* Campaigns Section */}
        {showCampaignForm && !showDataManagement && !showQRSettings && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Donation Campaigns</h1>
                <p className="text-white/70 text-lg">Create and manage fundraising campaigns</p>
              </div>
              <Button
                onClick={() => setShowCampaignForm(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-6 text-lg transition hover:scale-105"
              >
                ✕ CLOSE
              </Button>
            </div>

            {/* Campaign Creation Form */}
            <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#B4D700] p-10 mb-12 shadow-2xl rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Campaign</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.campaign_name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })}
                    className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="e.g., Emergency Food Relief"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={campaignForm.target_amount}
                      onChange={(e) => setCampaignForm({ ...campaignForm, target_amount: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="100000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">Raised Amount (₹)</label>
                    <input
                      type="number"
                      value={campaignForm.raised_amount}
                      onChange={(e) => setCampaignForm({ ...campaignForm, raised_amount: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#FF6B35] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">People to Help</label>
                    <input
                      type="number"
                      value={campaignForm.people_helped}
                      onChange={(e) => setCampaignForm({ ...campaignForm, people_helped: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] font-bold py-3 hover:shadow-xl transition"
                >
                  CREATE CAMPAIGN
                </Button>
              </form>
            </Card>

            {/* Campaigns List */}
            <div className="space-y-6">
              {campaigns.map((campaign) => {
                const percentage = (campaign.raised_amount / campaign.target_amount) * 100
                return (
                  <Card
                    key={campaign.id}
                    className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-8 shadow-xl rounded-2xl"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{campaign.campaign_name}</h3>
                        <p className="text-white/70">
                          Target:{" "}
                          <span className="font-bold text-[#B4D700]">₹{campaign.target_amount.toLocaleString()}</span>
                          {" | "}
                          Raised:{" "}
                          <span className="font-bold text-[#FF6B35]">₹{campaign.raised_amount.toLocaleString()}</span>
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          People to help: {campaign.people_helped}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingCampaignId(campaign.id)
                            setManualRaisedAmount(campaign.raised_amount.toString())
                          }}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-bold rounded-lg transition"
                        >
                          ✏️ EDIT AMOUNT
                        </button>
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                          className={`px-6 py-2 font-bold rounded-lg transition ${
                            campaign.status === "active"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                        >
                          {campaign.status === "active" ? "🟢 ACTIVE" : "🔴 INACTIVE"}
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          disabled={deletingCampaign === campaign.id}
                          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 font-bold rounded-lg transition disabled:opacity-50"
                        >
                          {deletingCampaign === campaign.id ? "⏳ DELETING..." : "🗑️ DELETE"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Manual Update Form */}
                    {editingCampaignId === campaign.id && (
                      <div className="mb-4 p-4 bg-[#2B2015] rounded-lg border-2 border-[#FF6B35]">
                        <label className="block text-white/80 font-semibold mb-2">Update Raised Amount (₹)</label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={manualRaisedAmount}
                            onChange={(e) => setManualRaisedAmount(e.target.value)}
                            className="flex-1 bg-[#4A3F33] border-2 border-[#B4D700] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            placeholder="Enter amount"
                          />
                          <Button
                            onClick={() => updateCampaignRaisedAmount(campaign.id)}
                            className="bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] font-bold px-6"
                          >
                            ✓ UPDATE
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCampaignId(null)
                              setManualRaisedAmount("")
                            }}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold px-6"
                          >
                            ✕ CANCEL
                          </Button>
                        </div>
                        <p className="text-white/60 text-xs mt-2">
                          💡 Tip: This updates the raised amount manually. Online donations are automatically added.
                        </p>
                      </div>
                    )}
                    <div className="w-full bg-[#2B2015] rounded-full h-4 border-2 border-[#B4D700] overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF6B35] to-[#B4D700] h-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-white/70 text-sm mt-3">
                      {percentage.toFixed(0)}% funded • {campaign.people_helped} devotees to help
                    </p>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Seva Opportunities Section - HIDDEN */}
        {false && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Seva Opportunities</h1>
                <p className="text-white/70 text-lg">Create and manage seva offerings</p>
              </div>
            </div>

            {/* Seva Creation/Edit Form */}
            <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#1E3A8A] p-10 mb-12 shadow-2xl rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingSevaId ? "Edit Seva Opportunity" : "Create New Seva Opportunity"}
                </h2>
                {editingSevaId && (
                  <Button
                    onClick={() => {
                      setEditingSevaId(null)
                      setSevaForm({ name: "", description: "", unit_price: "", total_quantity: "", category: "Food Distribution" })
                    }}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold"
                  >
                    ✕ CANCEL EDIT
                  </Button>
                )}
              </div>
              <form onSubmit={handleCreateSeva} className="space-y-6">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Seva Name</label>
                  <input
                    type="text"
                    value={sevaForm.name}
                    onChange={(e) => setSevaForm({ ...sevaForm, name: e.target.value })}
                    className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="e.g., Annadaan Seva (100 people)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Description</label>
                  <textarea
                    value={sevaForm.description}
                    onChange={(e) => setSevaForm({ ...sevaForm, description: e.target.value })}
                    className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="Brief description of the seva"
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">Unit Price (₹)</label>
                    <input
                      type="number"
                      value={sevaForm.unit_price}
                      onChange={(e) => setSevaForm({ ...sevaForm, unit_price: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="3000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">Total Quantity</label>
                    <input
                      type="number"
                      value={sevaForm.total_quantity}
                      onChange={(e) => setSevaForm({ ...sevaForm, total_quantity: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-semibold mb-2">Category</label>
                    <select
                      value={sevaForm.category}
                      onChange={(e) => setSevaForm({ ...sevaForm, category: e.target.value })}
                      className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option>Food Distribution</option>
                      <option>Festival Seva</option>
                      <option>Deity Seva</option>
                      <option>Temple Seva</option>
                      <option>Goshala Seva</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white font-bold py-3 hover:shadow-xl transition"
                >
                  {editingSevaId ? "✓ UPDATE SEVA OPPORTUNITY" : "CREATE SEVA OPPORTUNITY"}
                </Button>
              </form>
            </Card>

            {/* Seva Opportunities List */}
            <div className="space-y-6">
              {sevaOpportunities.map((seva) => {
                const percentage = (seva.obtained_quantity / seva.total_quantity) * 100
                return (
                  <Card
                    key={seva.id}
                    className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#1E3A8A] p-8 shadow-xl rounded-2xl"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-[#1E3A8A] bg-[#1E3A8A]/20 px-3 py-1 rounded-full">
                            {seva.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{seva.name}</h3>
                        <p className="text-white/70 mb-2">{seva.description}</p>
                        <p className="text-white/70">
                          Price: <span className="font-bold text-[#B4D700]">₹{seva.unit_price.toLocaleString()}</span>
                          {" | "}
                          Progress:{" "}
                          <span className="font-bold text-[#FF6B35]">
                            {seva.obtained_quantity} / {seva.total_quantity}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setEditingSevaId(seva.id)
                            setSevaForm({
                              name: seva.name,
                              description: seva.description || "",
                              unit_price: seva.unit_price.toString(),
                              total_quantity: seva.total_quantity.toString(),
                              category: seva.category,
                            })
                            // Scroll to form
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-bold px-4 py-2 rounded-lg transition"
                        >
                          ✏️ EDIT
                        </Button>
                        <Button
                          onClick={() => handleDeleteSeva(seva.id)}
                          disabled={deletingSeva === seva.id}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingSeva === seva.id ? "⏳ DELETING..." : "🗑️ DELETE"}
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-[#2B2015] rounded-full h-4 border-2 border-[#1E3A8A] overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF6B35] to-[#B4D700] h-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-white/70 text-sm mt-3">
                      {percentage.toFixed(0)}% completed • {seva.total_quantity - seva.obtained_quantity} units remaining
                    </p>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Donations Section - HIDDEN */}
        {false && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Donations Received</h1>
                <p className="text-white/70 text-lg">View all donations and track real-time updates</p>
              </div>
            </div>
            <DonationsList />
          </>
        )}
      </div>
    </div>
  )
}
