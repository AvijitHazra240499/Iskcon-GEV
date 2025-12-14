"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import QRCode from "qrcode"

interface Activity {
  people_served: number
  cost_per_plate: number | null
  activity_type: string
}

interface DonationCampaign {
  id: string
  campaign_name: string
  target_amount: number
  raised_amount: number
  people_helped: number
  status: string
}

interface CostData {
  type: string
  total_cost: number
  people_served: number
}

interface RecentDonation {
  id: string
  amount: number
  created_at: string
  donation_campaigns: {
    campaign_name: string
  } | null
}

const COLORS = ["#FF6B35", "#B4D700", "#3B82F6", "#9333EA", "#10B981", "#F59E0B"]

export default function DonationsPage() {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([])
  const [costData, setCostData] = useState<CostData[]>([])
  const [totalImpact, setTotalImpact] = useState({
    total_cost: 0,
    total_people: 0,
    cost_per_person: 0,
  })
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState("500")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [customAmount, setCustomAmount] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [manualCampaignName, setManualCampaignName] = useState("")
  const [showManualCampaign, setShowManualCampaign] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [baseUpiText, setBaseUpiText] = useState<string>("")
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    loadDonationData()
    loadQRCode()
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    // Set up real-time subscription for donation campaigns
    const supabase = createClient()
    const campaignSubscription = supabase
      .channel("donation_campaigns_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donation_campaigns",
        },
        (payload) => {
          console.log("Campaign updated:", payload)
          loadDonationData()
        }
      )
      .subscribe()

    // Set up real-time subscription for activities
    const activitySubscription = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        (payload) => {
          console.log("Activity updated:", payload)
          loadDonationData()
        }
      )
      .subscribe()

    // Set up real-time subscription for recent donations
    const donationSubscription = supabase
      .channel("donations_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
        },
        (payload) => {
          console.log("New donation received:", payload)
          loadRecentDonations()
          loadDonationData()
        }
      )
      .subscribe()

    loadRecentDonations()

    return () => {
      campaignSubscription.unsubscribe()
      activitySubscription.unsubscribe()
      donationSubscription.unsubscribe()
    }
  }, [])

  async function loadQRCode() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "donation_qr_text")
        .single()

      if (!error && data && data.value) {
        // Store the base UPI text (without amount)
        setBaseUpiText(data.value)
      }
    } catch (err) {
      console.error("Error loading QR code:", err)
    }
  }

  // Generate QR code with amount included
  async function generateQRWithAmount(amount: string) {
    if (!baseUpiText) return

    try {
      // Parse the UPI URL and add/update the amount
      let upiWithAmount = baseUpiText
      
      // Check if it's a UPI URL
      if (baseUpiText.includes("upi://")) {
        // Remove existing amount parameter if present
        upiWithAmount = baseUpiText.replace(/&am=[^&]*/g, "").replace(/\?am=[^&]*&?/g, "?")
        
        // Add the new amount
        if (upiWithAmount.includes("?")) {
          upiWithAmount = `${upiWithAmount}&am=${amount}`
        } else {
          upiWithAmount = `${upiWithAmount}?am=${amount}`
        }
      }

      // Generate QR code with amount
      const qrDataUrl = await QRCode.toDataURL(upiWithAmount, {
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

  async function loadRecentDonations() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("donations")
        .select(
          `
          id,
          amount,
          created_at,
          donation_campaigns (
            campaign_name
          )
        `
        )
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        // Silently handle error - table might not exist yet
        setRecentDonations([])
        return
      }
      setRecentDonations(data || [])
    } catch (err) {
      // Silently handle error - table might not exist yet
      setRecentDonations([])
    }
  }

  async function loadDonationData() {
    try {
      const supabase = createClient()

      // Load donation campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("status", "active")

      if (campaignsError) {
        console.error("Error loading campaigns:", campaignsError)
        throw campaignsError
      }
      setCampaigns(campaignsData || [])
      if (campaignsData && campaignsData.length > 0) {
        setSelectedCampaignId(campaignsData[0].id)
      }

      // Load activities for cost calculations
      const { data: activitiesData, error: activError } = await supabase
        .from("activities")
        .select("people_served, cost_per_plate, activity_type")

      if (activError) {
        console.error("Error loading activities:", activError)
        throw activError
      }

      const activities = activitiesData as Activity[]

      // Calculate costs by type
      const costByType: Record<string, { total_cost: number; people_served: number }> = {}
      let totalCost = 0
      let totalPeople = 0

      activities.forEach((activity) => {
        const cost = (activity.cost_per_plate || 50) * activity.people_served
        totalCost += cost
        totalPeople += activity.people_served

        if (!costByType[activity.activity_type]) {
          costByType[activity.activity_type] = { total_cost: 0, people_served: 0 }
        }
        costByType[activity.activity_type].total_cost += cost
        costByType[activity.activity_type].people_served += activity.people_served
      })

      const costDataArray = Object.entries(costByType).map(([type, data]) => ({
        type,
        total_cost: data.total_cost,
        people_served: data.people_served,
      }))

      setCostData(costDataArray)
      setTotalImpact({
        total_cost: totalCost,
        total_people: totalPeople,
        cost_per_person: totalPeople > 0 ? totalCost / totalPeople : 0,
      })
    } catch (err) {
      console.error("Error loading donation data:", err)
      // Set empty data to prevent UI issues
      setCampaigns([])
      setCostData([])
      setTotalImpact({
        total_cost: 0,
        total_people: 0,
        cost_per_person: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDonate() {
    const amount = Number.parseInt(donationAmount) * 100 // Convert to paise
    const campaignName = campaigns.find((c) => c.id === selectedCampaignId)?.campaign_name || "Govardhan Seva"

    const response = await fetch("/api/create-donation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        campaignId: selectedCampaignId,
        campaignName,
      }),
    })

    const data = await response.json()

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "Govardhan Annakshetra",
      description: `Donation to ${campaignName}`,
      order_id: data.orderId,
      handler: async (response: any) => {
        const verifyResponse = await fetch("/api/verify-donation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            campaignId: selectedCampaignId,
            amount: Number.parseInt(donationAmount),
          }),
        })

        if (verifyResponse.ok) {
          // Show success message
          const successDiv = document.createElement("div")
          successDiv.className =
            "fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce"
          successDiv.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="text-2xl">🙏</span>
              <div>
                <p class="font-bold">Donation Successful!</p>
                <p class="text-sm">Thank you for your seva. May Krishna bless you!</p>
              </div>
            </div>
          `
          document.body.appendChild(successDiv)
          setTimeout(() => successDiv.remove(), 5000)

          // Reload data to show updated charts and campaigns
          loadDonationData()
          setDonationAmount("500")
        } else {
          alert("Payment verification failed. Please contact support.")
        }
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#B4D700",
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💝</div>
          <div className="text-white text-2xl font-bold">Loading Donation Data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-[#FF6B35] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <img
                src="/logo-govardhan-circle.png"
                alt="Govardhan Annakshetra"
                className="w-12 h-12 rounded-full border-2 border-[#B4D700]"
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#9333EA] mb-4">
            Donation Transparency
          </h1>
          <p className="text-white/80 text-lg">See exactly how your donations help us serve more devotees</p>
        </div>

        {/* Impact Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] border-0 hover:shadow-2xl hover:scale-105 transition">
            <div className="p-8 text-center">
              <p className="text-white/90 text-sm uppercase font-bold tracking-wider mb-2">Total Cost Incurred</p>
              <p className="text-4xl font-bold text-white">₹{(totalImpact.total_cost / 100000).toFixed(1)}L</p>
              <p className="text-white/70 text-xs mt-3">For all seva activities</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#B4D700] to-[#6B8C0A] border-0 hover:shadow-2xl hover:scale-105 transition">
            <div className="p-8 text-center">
              <p className="text-[#2B2015]/90 text-sm uppercase font-bold tracking-wider mb-2">Devotees Served</p>
              <p className="text-4xl font-bold text-[#2B2015]">{(totalImpact.total_people / 100000).toFixed(1)}L+</p>
              <p className="text-[#2B2015]/70 text-xs mt-3">Across all activities</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] border-0 hover:shadow-2xl hover:scale-105 transition">
            <div className="p-8 text-center">
              <p className="text-white/90 text-sm uppercase font-bold tracking-wider mb-2">Cost Per Devotee</p>
              <p className="text-4xl font-bold text-white">₹{totalImpact.cost_per_person.toFixed(2)}</p>
              <p className="text-white/70 text-xs mt-3">Average investment per person</p>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#FF6B35] p-6 shadow-xl rounded-2xl">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-[#FF6B35]">📊</span>
              Cost Breakdown by Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6B5A4A" />
                <XAxis dataKey="type" stroke="#F5F1E8" tick={{ fill: "#F5F1E8", fontSize: 12 }} />
                <YAxis stroke="#F5F1E8" tick={{ fill: "#F5F1E8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2B2015",
                    border: "2px solid #FF6B35",
                    borderRadius: "8px",
                    color: "#F5F1E8",
                  }}
                  formatter={(value) => `₹${(value as number).toLocaleString()}`}
                />
                <Bar dataKey="total_cost" fill="#FF6B35" name="Total Cost (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-6 shadow-xl rounded-2xl">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-[#B4D700]">🎯</span>
              People Served by Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costData}
                  dataKey="people_served"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #B4D700",
                    borderRadius: "8px",
                    color: "#000000",
                  }}
                  itemStyle={{ color: "#000000" }}
                  labelStyle={{ color: "#000000", fontWeight: "bold" }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} people`, name]}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  wrapperStyle={{ color: "#F5F1E8", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Active Donation Campaigns & Donation Form */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Campaigns Section */}
          {campaigns.length > 0 && (
            <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#1E3A8A] p-8 shadow-xl rounded-2xl">
              <h2 className="text-white font-bold text-2xl mb-8 flex items-center gap-2">
                <span className="text-[#1E3A8A]">💝</span>
                Active Campaigns ({campaigns.length})
              </h2>
              <div className="space-y-6">
                {campaigns.slice(0, 5).map((campaign) => {
                  const percentage = (campaign.raised_amount / campaign.target_amount) * 100
                  return (
                    <div key={campaign.id} className="border-b-2 border-[#6B5A4A] pb-6 last:border-b-0 last:pb-0">
                      <h3 className="text-white font-bold text-lg mb-3">{campaign.campaign_name}</h3>
                      <div className="mb-3">
                        <div className="flex justify-between text-white/70 text-sm mb-2">
                          <span className="font-semibold">₹{campaign.raised_amount.toLocaleString()}</span>
                          <span className="font-semibold">₹{campaign.target_amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#2B2015] rounded-full h-5 border-2 border-[#1E3A8A] overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-[#FF6B35] to-[#B4D700] h-full transition-all duration-500 flex items-center justify-center"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-xs font-bold text-[#2B2015]">{percentage.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                        <p className="text-[#FF6B35] text-sm font-bold mt-2">{percentage.toFixed(0)}% funded</p>
                      </div>
                      <p className="text-white/70 text-sm">
                        <span className="font-bold text-[#B4D700]">{campaign.people_helped}</span> devotees helped
                      </p>
                    </div>
                  )
                })}
              </div>
              {campaigns.length > 5 && (
                <Link href="/impact" className="block mt-6">
                  <button className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white py-3 rounded-lg font-bold hover:shadow-xl transition">
                    View All {campaigns.length} Campaigns →
                  </button>
                </Link>
              )}
            </Card>
          )}

          {/* Donation Form */}
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-8 shadow-xl rounded-2xl">
            <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
              <span className="text-[#B4D700]">🙏</span>
              Make a Donation
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 font-semibold mb-3">Select Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedCampaignId(value)
                    setShowManualCampaign(value === "manual")
                    if (value !== "manual") {
                      setManualCampaignName("")
                    }
                  }}
                  className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  <option value="">No Campaign (General Donation)</option>
                  <option value="manual">✏️ Manual Entry (Type Custom Seva)</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.campaign_name}
                    </option>
                  ))}
                  <optgroup label="Annadaan Seva">
                    <option value="annadaan-100">Annadaan Seva (100 people)</option>
                    <option value="annadaan-200">Annadaan Seva (200 people)</option>
                    <option value="annadaan-500">Annadaan Seva (500 people)</option>
                    <option value="janmashtami-annadaan">Janmashtami Annadaan Part Seva</option>
                  </optgroup>
                  <optgroup label="Temple Seva">
                    <option value="radha-vrindaban-dress">Sri Sri Radha Vrindaban Behari Dress</option>
                    <option value="maha-aarati">Maha Aarati Seva</option>
                    <option value="festival-garland">Festival Garland Seva</option>
                    <option value="festival-bhoga">Festival Bhoga Seva</option>
                    <option value="maha-abhishek">Maha Abhishek Seva</option>
                    <option value="festival-decoration">Festival Decoration</option>
                    <option value="giriraj-fullday">Giriraj Ji Full day Seva</option>
                  </optgroup>
                  <optgroup label="Prasadam Distribution">
                    <option value="halwa-distribution">Halwa Distribution</option>
                  </optgroup>
                  <optgroup label="Gau Seva">
                    <option value="green-grass">Green grass for all cows</option>
                    <option value="fodder-cows">Fodder for all cows</option>
                  </optgroup>
                </select>
                
                {/* Manual Campaign Name Input */}
                {showManualCampaign && (
                  <div className="mt-4">
                    <label className="block text-white/80 font-semibold mb-2">Enter Custom Seva Name</label>
                    <input
                      type="text"
                      value={manualCampaignName}
                      onChange={(e) => setManualCampaignName(e.target.value)}
                      className="w-full bg-[#2B2015] border-2 border-[#FF6B35] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4D700]"
                      placeholder="e.g., Special Festival Seva, Custom Donation"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-3">Donation Amount (₹)</label>
                
                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["500", "1000", "2500", "5000", "10000", "25000"].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setDonationAmount(amount)
                        setShowCustomInput(false)
                        setCustomAmount("")
                      }}
                      className={`py-3 px-4 rounded-lg font-bold transition ${
                        donationAmount === amount && !showCustomInput
                          ? "bg-gradient-to-r from-[#FF6B35] to-[#B4D700] text-[#2B2015]"
                          : "bg-[#2B2015] text-white border-2 border-[#6B5A4A] hover:border-[#B4D700]"
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                {/* Custom amount button */}
                <button
                  onClick={() => {
                    setShowCustomInput(!showCustomInput)
                    if (!showCustomInput) {
                      setDonationAmount("")
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-bold mb-3 transition ${
                    showCustomInput
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#B4D700] text-[#2B2015]"
                      : "bg-[#2B2015] text-white border-2 border-[#6B5A4A] hover:border-[#B4D700]"
                  }`}
                >
                  {showCustomInput ? "✓ Custom Amount Selected" : "Enter Custom Amount"}
                </button>

                {/* Custom amount input */}
                {showCustomInput && (
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setDonationAmount(e.target.value)
                    }}
                    className="w-full bg-[#2B2015] border-2 border-[#B4D700] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="Enter custom amount (min ₹100)"
                    min="100"
                  />
                )}
              </div>

              <div className="bg-[#2B2015] border-l-4 border-[#FF6B35] p-4 rounded">
                <p className="text-white/70 text-sm">
                  <span className="font-bold text-[#B4D700]">Your donation will help serve:</span>
                  <br />
                  Approximately{" "}
                  <span className="text-[#FF6B35] font-bold">
                    {Math.floor(Number.parseInt(donationAmount || "0") / 50)}
                  </span>{" "}
                  devotees with nutritious prasadam
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDonate}
                  className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#B4D700] text-[#2B2015] font-bold py-4 text-lg hover:shadow-xl hover:scale-105 transition"
                >
                  💳 PAY ONLINE
                </Button>
                {baseUpiText && (
                  <Button
                    onClick={async () => {
                      await generateQRWithAmount(donationAmount || "0")
                      setShowQRModal(true)
                    }}
                    className="flex-1 bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold py-4 text-lg hover:shadow-xl hover:scale-105 transition"
                  >
                    📱 SCAN QR
                  </Button>
                )}
              </div>

              <p className="text-white/50 text-xs text-center">
                Pay online via Razorpay or scan QR code for UPI payment. 100% goes to seva.
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Donations Ticker */}
        {recentDonations.length > 0 && (
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#9333EA] p-8 shadow-xl rounded-2xl mb-12">
            <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
              <span className="text-[#9333EA]">💝</span>
              Recent Donations
              <span className="ml-2 text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full animate-pulse">
                LIVE
              </span>
            </h2>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex justify-between items-center bg-[#2B2015] border-l-4 border-[#B4D700] p-4 rounded-lg hover:bg-[#3A2F25] transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🙏</div>
                    <div>
                      <p className="text-white font-bold text-lg">₹{donation.amount.toLocaleString()}</p>
                      <p className="text-white/60 text-sm">
                        {donation.donation_campaigns?.campaign_name || "General Donation"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs">
                      {new Date(donation.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-white/60 text-xs">
                      {new Date(donation.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Transparency Statement */}
        <Card className="bg-gradient-to-r from-[#FF6B35] via-[#9333EA] to-[#B4D700] p-12 text-center shadow-2xl rounded-2xl">
          <div className="text-5xl mb-4">🙏</div>
          <h3 className="text-white font-bold text-3xl mb-6">Our Commitment to Transparency</h3>
          <p className="text-white/90 leading-relaxed text-lg max-w-2xl mx-auto">
            Every rupee donated goes directly to serving devotees through our Langar and Annakshetra programs. We
            maintain detailed records of all activities, costs, and impact metrics to ensure complete accountability.
            Your donation is not just charity—it's divine service to feed and nourish those in need.
          </p>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] rounded-2xl p-8 max-w-md w-full border-4 border-[#B4D700] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">📱 Scan to Pay</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-white/60 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
              <img
                src={qrCodeUrl}
                alt="Payment QR Code"
                className="max-w-[280px] max-h-[280px] object-contain"
              />
            </div>

            <div className="text-center space-y-3">
              <p className="text-white font-bold text-xl">
                Amount: ₹{donationAmount || "0"}
              </p>
              <p className="text-white/70 text-sm">
                Scan this QR code with any UPI app to make your donation
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <span className="bg-[#2B2015] text-white/60 px-3 py-1 rounded-full text-xs">Google Pay</span>
                <span className="bg-[#2B2015] text-white/60 px-3 py-1 rounded-full text-xs">PhonePe</span>
                <span className="bg-[#2B2015] text-white/60 px-3 py-1 rounded-full text-xs">Paytm</span>
                <span className="bg-[#2B2015] text-white/60 px-3 py-1 rounded-full text-xs">BHIM</span>
              </div>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] font-bold py-3 rounded-lg hover:shadow-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
