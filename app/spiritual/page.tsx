"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

interface Quote {
  id: string
  quote_text: string
  source: string
}

const defaultQuotes = [
  {
    id: "1",
    quote_text: '"To relieve HUNGER is a DIVINE SERVICE"',
    source: "Bhagavad Gita",
  },
  {
    id: "2",
    quote_text: '"When you feed someone, you feed God"',
    source: "Vedic Philosophy",
  },
  {
    id: "3",
    quote_text: '"Annadata sukhi bhava - May the feeder be happy"',
    source: "Ancient Sanskrit Blessing",
  },
  {
    id: "4",
    quote_text: '"All glories to Sri Guru and Gauranga"',
    source: "ISKCON Mantra",
  },
  {
    id: "5",
    quote_text: '"Service to humanity is service to God"',
    source: "Spiritual Teaching",
  },
]

export default function SpiritualPage() {
  const [quotes, setQuotes] = useState<Quote[]>(defaultQuotes)
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState(0)

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("quotes").select("*").limit(10)
      if (error) throw error
      if (data && data.length > 0) {
        setQuotes(data)
      }
    } catch (err) {
      console.error("Error loading quotes:", err)
    } finally {
      setLoading(false)
    }
  }

  const rotateQuote = () => {
    setSelectedQuote((prev) => (prev + 1) % quotes.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">ॐ</div>
          <div className="text-cream text-2xl font-bold">Loading Divine Wisdom...</div>
        </div>
      </div>
    )
  }

  const currentQuote = quotes[selectedQuote]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-[#9333EA] backdrop-blur-sm">
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
              <Link href="/" className="text-cream hover:text-[#FF6B35] transition font-medium">
                Home
              </Link>
              <Link href="/impact" className="text-cream hover:text-[#B4D700] transition font-medium">
                Impact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Spiritual Banner */}
        <div className="text-center mb-16">
          <div className="mb-6 drop-shadow-lg animate-pulse flex justify-center">
            <img
                src="/logo-govardhan-circle.png"
                alt="Govardhan Annakshetra"
                className="w-20 h-20 rounded-full border-2 border-[#B4D700] shadow-lg"
              />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#9333EA] mb-4 whitespace-nowrap">Govardhan Annakshetra</h1>
          <p className="text-cream/80 text-lg">Spiritual inspiration for our sacred service</p>
        </div>

        {/* Daily Quote */}
        <Card className="bg-gradient-to-br from-[#9333EA] to-[#7E22CE] border-4 border-[#B4D700] p-12 mb-16 text-center shadow-2xl rounded-2xl">
          <div className="text-4xl mb-4 drop-shadow-lg">✨</div>
          <p className="text-3xl text-white leading-relaxed font-serif mb-8 italic">{currentQuote.quote_text}</p>
          <p className="text-[#B4D700] text-xl font-bold">— {currentQuote.source}</p>
          <button
            onClick={rotateQuote}
            className="mt-10 bg-gradient-to-r from-[#B4D700] to-[#6B8C0A] text-[#2B2015] px-8 py-3 rounded-lg font-bold hover:shadow-xl hover:scale-105 transition"
          >
            ➜ Next Quote
          </button>
        </Card>

        {/* Seva Philosophy */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#FF6B35] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
            <div className="text-5xl mb-4">🍛</div>
            <h2 className="text-cream font-bold text-2xl mb-4 text-[#FF6B35]">Langar - The Sacred Meal</h2>
            <p className="text-cream/80 leading-relaxed">
              Langar is the practice of serving free meals to all, regardless of faith, caste, or status. It represents
              the principle that all people are equal, and everyone deserves nourishment. This ancient tradition
              embodies divine compassion and selfless service.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#3A2F25] border-2 border-[#B4D700] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
            <div className="text-5xl mb-4">🏛️</div>
            <h2 className="text-cream font-bold text-2xl mb-4 text-[#B4D700]">Annakshetra - Temple of Food</h2>
            <p className="text-cream/80 leading-relaxed">
              Annakshetra is a sacred distribution center providing nourishment to the needy. From the Sanskrit words
              "Anna" (food) and "Kshetra" (field/place), it represents a dedicated space for feeding and caring for
              those in need through divine service.
            </p>
          </Card>
        </div>

        {/* Core Values */}
        <h2 className="text-cream font-bold text-4xl mb-10 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] border-0 p-8 text-center rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-white font-bold text-xl mb-3">DEVOTION</h3>
            <p className="text-white/90">Serving with pure heart and spiritual intention</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#B4D700] to-[#6B8C0A] border-0 p-8 text-center rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-[#2B2015] font-bold text-xl mb-3">COMPASSION</h3>
            <p className="text-[#2B2015]/90">Caring for all beings without discrimination</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] border-0 p-8 text-center rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-white font-bold text-xl mb-3">UNITY</h3>
            <p className="text-white/90">Coming together for a common divine purpose</p>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-[#FF6B35] via-[#9333EA] to-[#B4D700] p-12 text-center shadow-2xl rounded-2xl mb-12">
          <h3 className="text-white text-4xl font-bold mb-4">Join Our Sacred Service</h3>
          <p className="text-white/90 mb-10 text-lg font-semibold">
            Be part of this divine mission to nourish body, mind, and soul
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/admin"
              className="bg-white text-[#FF6B35] px-8 py-4 rounded-lg font-bold hover:scale-105 transition shadow-lg"
            >
              ✓ VOLUNTEER TODAY
            </Link>
            <Link
              href="/donations"
              className="bg-white/20 border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/30 transition"
            >
              💝 SUPPORT US
            </Link>
          </div>
        </Card>

        {/* Footer Message */}
        <p className="text-center text-cream/60 text-sm italic">
          🙏 All glories to Sri Guru and Gauranga | Hare Krishna Hare Krishna Krishna Krishna Hare Hare 🙏
        </p>
      </div>
    </div>
  )
}
