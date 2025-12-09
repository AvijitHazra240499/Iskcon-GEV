"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

interface Donation {
  id: string
  amount: number
  donor_name: string | null
  donor_email: string | null
  payment_status: string
  created_at: string
  campaign_id: string
  donation_campaigns: {
    campaign_name: string
  } | null
}

export default function DonationsList() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDonations()

    // Set up real-time subscription
    const supabase = createClient()
    const subscription = supabase
      .channel("donations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
        },
        (payload) => {
          console.log("Donation updated:", payload)
          loadDonations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadDonations() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("donations")
        .select(
          `
          *,
          donation_campaigns (
            campaign_name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setDonations(data || [])
    } catch (err) {
      console.error("Error loading donations:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl">Loading donations...</div>
      </div>
    )
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] border-0 p-8 shadow-xl rounded-2xl">
        <div className="text-center">
          <p className="text-white/90 text-sm uppercase font-bold tracking-wider mb-2">Total Donations Received</p>
          <p className="text-5xl font-bold text-white">₹{totalDonations.toLocaleString()}</p>
          <p className="text-white/70 text-sm mt-3">{donations.length} donations</p>
        </div>
      </Card>

      <div className="space-y-4">
        {donations.map((donation) => (
          <Card
            key={donation.id}
            className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-6 shadow-xl rounded-xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  ₹{donation.amount.toLocaleString()}
                  <span
                    className={`ml-3 text-xs px-3 py-1 rounded-full ${
                      donation.payment_status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {donation.payment_status}
                  </span>
                </h3>
                <p className="text-white/70 text-sm">
                  Campaign:{" "}
                  <span className="font-bold text-[#B4D700]">
                    {donation.donation_campaigns?.campaign_name || "General"}
                  </span>
                </p>
                {donation.donor_email && (
                  <p className="text-white/60 text-xs mt-1">Donor: {donation.donor_email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">
                  {new Date(donation.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
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
          </Card>
        ))}

        {donations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-white/70 text-lg">No donations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
