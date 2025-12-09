"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ActivityForm from "@/components/admin/activity-form"
import ActivityList from "@/components/admin/activity-list"
import DonationsList from "@/components/admin/donations-list"

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

export default function AdminPage() {
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

  useEffect(() => {
    loadData()
  }, [])

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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Tabs for Activities and Campaigns */}
        <div className="flex gap-4 mb-12 border-b-2 border-[#6B5A4A] overflow-x-auto">
          <button
            onClick={() => {
              setShowForm(false)
              setShowCampaignForm(false)
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              !showCampaignForm
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
            }}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              showCampaignForm
                ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Donation Campaigns
          </button>
        </div>

        {/* Activities Section */}
        {!showCampaignForm && (
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
        {showCampaignForm && (
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
