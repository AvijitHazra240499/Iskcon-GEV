"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Activity {
  id: string
  date: string
  activity_type: string
  location: string
  people_served: number
  villages_helped: number
  volunteers_count: number
  cost_per_plate?: number
}

interface DailyStats {
  date: string
  total: number
  langar: number
  annakshetra: number
  villageSeva: number
}

interface LocationStats {
  location: string
  count: number
  people_served: number
}

interface ActivityTypeStats {
  name: string
  value: number
}

interface DonationCampaign {
  id: string
  campaign_name: string
  target_amount: number
  raised_amount: number
  people_helped: number
  status: string
  created_at: string
}

const COLORS = ["#FF6B35", "#B4D700", "#3B82F6", "#9333EA", "#10B981", "#F59E0B"]

export default function ImpactPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [locationStats, setLocationStats] = useState<LocationStats[]>([])
  const [activityTypeStats, setActivityTypeStats] = useState<ActivityTypeStats[]>([])
  const [totals, setTotals] = useState({
    people_served: 0,
    villages_helped: 0,
    volunteers: 0,
    total_activities: 0,
    total_days: 0,
    avg_cost_plate: 0,
  })

  useEffect(() => {
    loadActivities()
    loadCampaigns()
  }, [])

  async function loadActivities() {
    try {
      let retries = 3
      let lastError: any = null

      while (retries > 0) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from("activities").select("*").order("date", { ascending: false })

          if (error) throw error

          setActivities(data || [])
          processStats(data || [])
          return
        } catch (err) {
          lastError = err
          retries--
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
      }

      throw lastError
    } catch (err) {
      console.error("Error loading activities:", err)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCampaigns() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("donation_campaigns")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading campaigns:", error)
      } else {
        setCampaigns(data || [])
      }
    } catch (err) {
      console.error("Error loading campaigns:", err)
    }
  }

  function processStats(data: Activity[]) {
    // Calculate totals
    const uniqueDates = new Set(data.map((a) => a.date)).size
    const totalCost = data.reduce((sum, a) => sum + (a.cost_per_plate || 0), 0)

    const totals = {
      people_served: data.reduce((sum, a) => sum + a.people_served, 0),
      villages_helped: data.reduce((sum, a) => sum + a.villages_helped, 0),
      volunteers: Math.max(...data.map((a) => a.volunteers_count), 0),
      total_activities: data.length,
      total_days: uniqueDates,
      avg_cost_plate: data.length > 0 ? totalCost / data.length : 0,
    }
    setTotals(totals)

    // Daily stats
    const dailyMap = new Map<string, DailyStats>()
    data.forEach((activity) => {
      const key = activity.date
      const existing = dailyMap.get(key) || { date: key, total: 0, langar: 0, annakshetra: 0, villageSeva: 0 }

      if (activity.activity_type === "Langar") existing.langar += activity.people_served
      else if (activity.activity_type === "Annakshetra") existing.annakshetra += activity.people_served
      else if (activity.activity_type === "Village Seva") existing.villageSeva += activity.people_served

      existing.total = existing.langar + existing.annakshetra + existing.villageSeva
      dailyMap.set(key, existing)
    })
    setDailyStats(
      Array.from(dailyMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30),
    )

    // Location stats
    const locationMap = new Map<string, LocationStats>()
    data.forEach((activity) => {
      const existing = locationMap.get(activity.location) || { location: activity.location, count: 0, people_served: 0 }
      existing.count += 1
      existing.people_served += activity.people_served
      locationMap.set(activity.location, existing)
    })
    setLocationStats(
      Array.from(locationMap.values())
        .sort((a, b) => b.people_served - a.people_served)
        .slice(0, 5),
    )

    // Activity type stats - now showing people served per activity type
    const typeMap = new Map<string, number>()
    data.forEach((activity) => {
      const current = typeMap.get(activity.activity_type) || 0
      typeMap.set(activity.activity_type, current + activity.people_served)
    })
    setActivityTypeStats(
      Array.from(typeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🙏</div>
          <div className="text-white text-2xl font-bold">Loading Divine Impact Data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-[#B4D700] backdrop-blur-sm">
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
              <Link href="/" className="text-white hover:text-[#FF6B35] transition font-medium">
                Home
              </Link>
              <Link href="/impact" className="text-[#B4D700] font-bold underline">
                Our Impact
              </Link>
              <Link href="/admin" className="text-white hover:text-[#B4D700] transition font-medium">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#B4D700] to-[#1E3A8A] mb-4">
            Our Divine Impact
          </h1>
          <p className="text-white/80 text-lg">
            Real-time statistics of Langar, Annakshetra, and Village Seva activities
          </p>
        </div>

        {/* Total Stats - Grid */}
        <div className="grid md:grid-cols-6 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] border-0 hover:shadow-2xl hover:scale-105 transition col-span-3 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-1">{(totals.people_served / 100000).toFixed(1)}L+</div>
              <p className="text-white/90 font-semibold text-sm">Prasadam Served</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#B4D700] to-[#6B8C0A] border-0 hover:shadow-2xl hover:scale-105 transition col-span-3 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-[#2B2015] mb-1">{totals.villages_helped}+</div>
              <p className="text-[#2B2015]/90 font-semibold text-sm">Villages Helped</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] border-0 hover:shadow-2xl hover:scale-105 transition col-span-3 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-1">{totals.volunteers}+</div>
              <p className="text-white/90 font-semibold text-sm">Peak Volunteers</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#9333EA] to-[#7E22CE] border-0 hover:shadow-2xl hover:scale-105 transition col-span-2 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{totals.total_activities}</div>
              <p className="text-white/90 font-semibold text-sm">Activities</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#059669] to-[#047857] border-0 hover:shadow-2xl hover:scale-105 transition col-span-2 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{totals.total_days}</div>
              <p className="text-white/90 font-semibold text-sm">Days of Seva</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-0 hover:shadow-2xl hover:scale-105 transition col-span-2 md:col-span-2">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">₹{totals.avg_cost_plate.toFixed(0)}</div>
              <p className="text-white/90 font-semibold text-sm">Avg Cost/Plate</p>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Trend */}
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#FF6B35] p-6 shadow-xl rounded-2xl">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-[#FF6B35]">📈</span>
              Monthly Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6B5A4A" />
                <XAxis dataKey="date" stroke="#F5F1E8" tick={{ fill: "#F5F1E8", fontSize: 12 }} />
                <YAxis stroke="#F5F1E8" tick={{ fill: "#F5F1E8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2B2015",
                    border: "2px solid #B4D700",
                    borderRadius: "8px",
                    color: "#F5F1E8",
                  }}
                />
                <Legend wrapperStyle={{ color: "#F5F1E8" }} />
                <Bar dataKey="langar" fill="#FF6B35" name="Langar" radius={[4, 4, 0, 0]} />
                <Bar dataKey="annakshetra" fill="#B4D700" name="Annakshetra" radius={[4, 4, 0, 0]} />
                <Bar dataKey="villageSeva" fill="#1E3A8A" name="Village Seva" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity Distribution */}
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-6 shadow-xl rounded-2xl">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-[#B4D700]">🎯</span>
              Activity Distribution (People Served)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityTypeStats as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {activityTypeStats.map((entry, index) => (
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

        {/* Top Locations */}
        <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#1E3A8A] p-6 shadow-xl rounded-2xl mb-12">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <span className="text-[#1E3A8A]">📍</span>
            Top Seva Locations
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#6B5A4A" />
              <XAxis type="number" stroke="#F5F1E8" tick={{ fill: "#F5F1E8", fontSize: 12 }} />
              <YAxis
                dataKey="location"
                type="category"
                stroke="#F5F1E8"
                width={100}
                tick={{ fill: "#F5F1E8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2B2015",
                  border: "2px solid #B4D700",
                  borderRadius: "8px",
                  color: "#F5F1E8",
                }}
              />
              <Bar dataKey="people_served" fill="#FF6B35" name="People Served" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activities Table */}
        <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#9333EA] p-6 shadow-xl rounded-2xl overflow-hidden">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <span className="text-[#9333EA]">📋</span>
            Recent Seva Entries ({activities.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="bg-[#2B2015] border-b-2 border-[#9333EA]">
                  <th className="text-left py-4 px-4 font-bold text-[#FF6B35]">Date</th>
                  <th className="text-left py-4 px-4 font-bold text-[#B4D700]">Type</th>
                  <th className="text-left py-4 px-4 font-bold text-white">Location</th>
                  <th className="text-right py-4 px-4 font-bold text-[#FF6B35]">People Served</th>
                  <th className="text-right py-4 px-4 font-bold text-[#B4D700]">Villages</th>
                  <th className="text-right py-4 px-4 font-bold text-white">Volunteers</th>
                  <th className="text-right py-4 px-4 font-bold text-[#9333EA]">Cost/Plate</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, idx) => (
                  <tr
                    key={activity.id}
                    className={`border-b border-[#6B5A4A] hover:bg-[#3A2F25] transition ${idx % 2 === 0 ? "bg-[#2B2015]/50" : ""}`}
                  >
                    <td className="py-4 px-4">{new Date(activity.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white ${activity.activity_type === "Langar" ? "bg-[#FF6B35]" : activity.activity_type === "Annakshetra" ? "bg-[#B4D700]" : "bg-[#1E3A8A]"}`}
                      >
                        {activity.activity_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{activity.location}</td>
                    <td className="py-4 px-4 text-right font-bold text-[#FF6B35]">
                      {activity.people_served.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#B4D700]">{activity.villages_helped}</td>
                    <td className="py-4 px-4 text-right text-white">{activity.volunteers_count}</td>
                    <td className="py-4 px-4 text-right font-bold text-[#9333EA]">
                      ₹{activity.cost_per_plate?.toFixed(2) || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Donation Campaigns Section */}
        {campaigns.length > 0 && (
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#1E3A8A] p-6 shadow-xl rounded-2xl overflow-hidden mt-12">
            <div className="bg-[#2B2015] px-8 py-4 border-b-2 border-[#1E3A8A] -m-6 mb-6">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <span className="text-[#1E3A8A]">💝</span>
                Active Donation Campaigns ({campaigns.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead className="bg-[#2B2015] border-b-2 border-[#1E3A8A]">
                  <tr>
                    <th className="text-left py-4 px-4 font-bold text-[#FF6B35]">Campaign Name</th>
                    <th className="text-right py-4 px-4 font-bold text-[#B4D700]">Target Amount</th>
                    <th className="text-right py-4 px-4 font-bold text-[#FF6B35]">Raised Amount</th>
                    <th className="text-center py-4 px-4 font-bold text-[#FFFFFF]">Progress</th>
                    <th className="text-right py-4 px-4 font-bold text-[#9333EA]">People to Help</th>
                    <th className="text-center py-4 px-4 font-bold text-[#B4D700]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, idx) => {
                    const percentage = (campaign.raised_amount / campaign.target_amount) * 100
                    return (
                      <tr
                        key={campaign.id}
                        className={`border-b border-[#6B5A4A] hover:bg-[#3A2F25] transition ${idx % 2 === 0 ? "bg-[#2B2015]/50" : ""}`}
                      >
                        <td className="py-4 px-4 font-medium text-white">{campaign.campaign_name}</td>
                        <td className="py-4 px-4 text-right font-bold text-[#B4D700]">
                          ₹{campaign.target_amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-[#FF6B35]">
                          ₹{campaign.raised_amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#2B2015] rounded-full h-3 border border-[#1E3A8A] overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#FF6B35] to-[#B4D700] h-full transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#FF6B35] min-w-[45px]">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-[#9333EA]">
                          {campaign.people_helped.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              campaign.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {campaign.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pie Chart for Campaigns */}
            <div className="mt-8 p-6 bg-[#2B2015] rounded-lg">
              <h3 className="text-white font-bold text-lg mb-4 text-center">Campaign Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaigns.map((c) => ({
                      name: c.campaign_name,
                      value: c.target_amount,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaigns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #1E3A8A",
                      borderRadius: "8px",
                      color: "#000000",
                    }}
                    itemStyle={{ color: "#000000" }}
                    labelStyle={{ color: "#000000", fontWeight: "bold" }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Target Amount"]}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    wrapperStyle={{ color: "#F5F1E8", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
