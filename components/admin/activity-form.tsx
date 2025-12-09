"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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

interface ActivityFormProps {
  editingActivity?: Activity | null
  onSuccess: () => void
}

export default function ActivityForm({ editingActivity, onSuccess }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    activity_type: "Langar",
    location: "",
    people_served: "",
    villages_helped: "",
    volunteers_count: "",
    cost_per_plate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showManualType, setShowManualType] = useState(false)
  const [manualActivityType, setManualActivityType] = useState("")

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        date: editingActivity.date,
        activity_type: editingActivity.activity_type,
        location: editingActivity.location,
        people_served: String(editingActivity.people_served),
        villages_helped: String(editingActivity.villages_helped),
        volunteers_count: String(editingActivity.volunteers_count),
        cost_per_plate: String(editingActivity.cost_per_plate || ""),
        notes: editingActivity.notes,
      })
    }
  }, [editingActivity])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()
      const payload = {
        date: formData.date,
        activity_type: formData.activity_type,
        location: formData.location,
        people_served: Number.parseInt(formData.people_served) || 0,
        villages_helped: Number.parseInt(formData.villages_helped) || 0,
        volunteers_count: Number.parseInt(formData.volunteers_count) || 0,
        cost_per_plate: Number.parseFloat(formData.cost_per_plate) || null,
        notes: formData.notes,
      }

      if (editingActivity) {
        console.log("Updating activity:", editingActivity.id, payload)
        const { data, error } = await supabase
          .from("activities")
          .update(payload)
          .eq("id", editingActivity.id)
          .select()
        
        if (error) {
          console.error("Update error:", error)
          throw error
        }
        console.log("Activity updated successfully:", data)
        setMessage("✨ Activity updated successfully! Hari Bol! 🙏")
      } else {
        console.log("Inserting new activity:", payload)
        const { data, error } = await supabase.from("activities").insert([payload]).select()
        if (error) {
          console.error("Insert error:", error)
          throw error
        }
        console.log("Activity inserted successfully:", data)
        setMessage("✨ Activity recorded successfully! Hari Bol! 🙏")
      }

      // Wait a moment for database to update, then refresh
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Call onSuccess to refresh the list and close form
      onSuccess()
      
      // Clear message after a moment
      setTimeout(() => {
        setMessage("")
      }, 1500)
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-[#B4D700] to-[#6B8C0A] rounded-full flex items-center justify-center text-white font-bold">
          📝
        </div>
        <h2 className="text-3xl font-bold text-cream">
          {editingActivity ? "Edit Seva Activity" : "Record Seva Activity"}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Activity Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#FF6B35] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Activity Type *</label>
          <select
            name="activity_type"
            value={showManualType ? "manual" : formData.activity_type}
            onChange={(e) => {
              const value = e.target.value
              if (value === "manual") {
                setShowManualType(true)
              } else {
                setShowManualType(false)
                setManualActivityType("")
                handleChange(e)
              }
            }}
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#1E3A8A] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 cursor-pointer"
          >
            <option value="manual">✏️ Manual Entry (Type Custom)</option>
            <option>Langar</option>
            <option>Annakshetra</option>
            <option>Village Seva</option>
            <option>Disaster Relief</option>
            <optgroup label="Annadaan Seva">
              <option>Annadaan Seva (100 people)</option>
              <option>Annadaan Seva (200 people)</option>
              <option>Annadaan Seva (500 people)</option>
              <option>Janmashtami Annadaan Part Seva</option>
            </optgroup>
            <optgroup label="Temple Seva">
              <option>Sri Sri Radha Vrindaban Behari Dress</option>
              <option>Maha Aarati Seva</option>
              <option>Festival Garland Seva</option>
              <option>Festival Bhoga Seva</option>
              <option>Maha Abhishek Seva</option>
              <option>Festival Decoration</option>
              <option>Giriraj Ji Full day Seva</option>
            </optgroup>
            <optgroup label="Prasadam Distribution">
              <option>Halwa Distribution</option>
            </optgroup>
            <optgroup label="Gau Seva">
              <option>Green grass for all cows</option>
              <option>Fodder for all cows</option>
            </optgroup>
          </select>
          
          {/* Manual Activity Type Input */}
          {showManualType && (
            <input
              type="text"
              value={manualActivityType}
              onChange={(e) => {
                setManualActivityType(e.target.value)
                setFormData((prev) => ({ ...prev, activity_type: e.target.value }))
              }}
              className="w-full bg-white/95 text-[#2B2015] border-2 border-[#FF6B35] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
              placeholder="Enter custom activity type (e.g., Special Festival Seva)"
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Vrindavan Temple"
            required
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#FF6B35] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">People Served *</label>
          <input
            type="number"
            name="people_served"
            value={formData.people_served}
            onChange={handleChange}
            placeholder="0"
            required
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#1E3A8A] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Villages Helped</label>
          <input
            type="number"
            name="villages_helped"
            value={formData.villages_helped}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#FF6B35] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Volunteers Count *</label>
          <input
            type="number"
            name="volunteers_count"
            value={formData.volunteers_count}
            onChange={handleChange}
            placeholder="0"
            required
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#1E3A8A] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-cream font-bold text-sm uppercase tracking-wider">Cost Per Plate (₹)</label>
          <input
            type="number"
            step="0.01"
            name="cost_per_plate"
            value={formData.cost_per_plate}
            onChange={handleChange}
            placeholder="e.g., 50"
            className="w-full bg-white/95 text-[#2B2015] border-2 border-[#FF6B35] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-cream font-bold text-sm uppercase tracking-wider">Notes & Special Details</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Special details about this seva activity..."
          rows={4}
          className="w-full bg-white/95 text-[#2B2015] border-2 border-[#1E3A8A] rounded-lg px-4 py-3 font-medium focus:outline-none focus:border-[#B4D700] focus:ring-2 focus:ring-[#B4D700]/30 placeholder-gray-400 resize-none"
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border-2 font-semibold ${message.includes("Error") ? "border-red-500 bg-red-500/10 text-red-300" : "border-[#B4D700] bg-[#B4D700]/10 text-[#B4D700]"}`}
        >
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] hover:shadow-xl font-bold py-4 text-lg rounded-lg transition hover:scale-105 disabled:opacity-70"
      >
        {loading ? "⏳ PROCESSING..." : editingActivity ? "✓ UPDATE ACTIVITY" : "✓ RECORD ACTIVITY"}
      </Button>
    </form>
  )
}
