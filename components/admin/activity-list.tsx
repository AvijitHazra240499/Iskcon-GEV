"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

interface ActivityListProps {
  activities: Activity[]
  loading: boolean
  onRefresh: () => void
  onEdit: (activity: Activity) => void
}

export default function ActivityList({ activities, loading, onRefresh, onEdit }: ActivityListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return

    setDeleting(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("activities").delete().eq("id", id)
      if (error) throw error
      onRefresh()
    } catch (err) {
      alert("Error deleting activity")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="text-cream text-center py-12 text-xl font-semibold">⏳ Loading activities...</div>
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#B4D700] p-12 text-center rounded-2xl shadow-xl">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-cream text-lg font-semibold">No activities recorded yet. Start by adding a new activity!</p>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-4 border-[#9333EA] overflow-hidden shadow-2xl rounded-2xl">
      <div className="bg-[#2B2015] px-8 py-4 border-b-2 border-[#9333EA]">
        <h2 className="text-cream font-bold text-2xl flex items-center gap-2">
          <span className="text-[#9333EA]">📋</span>
          Recent Seva Entries ({activities.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-cream text-sm">
          <thead className="bg-[#2B2015] border-b-2 border-[#9333EA]">
            <tr>
              <th className="text-left py-4 px-4 font-bold text-[#FF6B35]">Date</th>
              <th className="text-left py-4 px-4 font-bold text-[#B4D700]">Type</th>
              <th className="text-left py-4 px-4 font-bold text-[#FFFFFF]">Location</th>
              <th className="text-right py-4 px-4 font-bold text-[#FF6B35]">Served</th>
              <th className="text-right py-4 px-4 font-bold text-[#B4D700]">Villages</th>
              <th className="text-right py-4 px-4 font-bold text-[#FFFFFF]">Volunteers</th>
              <th className="text-right py-4 px-4 font-bold text-[#9333EA]">Cost/Plate</th>
              <th className="text-center py-4 px-4 font-bold text-[#FF6B35]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className={`border-b border-[#6B5A4A] hover:bg-[#3A2F25] transition ${idx % 2 === 0 ? "bg-[#2B2015]/50" : ""}`}
              >
                <td className="py-4 px-4 font-medium text-cream">{new Date(activity.date).toLocaleDateString()}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${activity.activity_type === "Langar" ? "bg-[#FF6B35]" : activity.activity_type === "Annakshetra" ? "bg-[#B4D700]" : "bg-[#1E3A8A]"}`}
                  >
                    {activity.activity_type}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium text-cream">{activity.location}</td>
                <td className="py-4 px-4 text-right font-bold text-[#FF6B35]">
                  {activity.people_served.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-bold text-[#B4D700]">{activity.villages_helped}</td>
                <td className="py-4 px-4 text-right font-bold text-[#FFFFFF]">{activity.volunteers_count}</td>
                <td className="py-4 px-4 text-right font-bold text-[#9333EA]">
                  ₹{activity.cost_per_plate?.toFixed(2) || "-"}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => onEdit(activity)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 text-xs font-bold rounded-lg transition hover:scale-105"
                    >
                      ✏️ EDIT
                    </Button>
                    <Button
                      onClick={() => handleDelete(activity.id)}
                      disabled={deleting === activity.id}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 text-xs font-bold rounded-lg transition hover:scale-105 disabled:opacity-70"
                    >
                      {deleting === activity.id ? "⏳" : "🗑️"} {deleting === activity.id ? "DEL" : "DELETE"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
