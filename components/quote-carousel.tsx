"use client"

import { useState, useEffect } from "react"

interface Quote {
  verse: string
  text: string
  theme: string
}

export default function QuoteCarousel({ quotes }: { quotes: Quote[] }) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [quotes.length])

  const currentQuote = quotes[currentQuoteIndex]

  return (
    <section className="bg-gradient-to-r from-[#1E3A8A] via-[#4A3F33] to-[#2B2015] py-16 my-16 rounded-2xl mx-4 border-l-8 border-[#FF6B35] shadow-2xl">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="text-[#FF6B35] text-lg font-bold mb-3">Bhagavad Gita {currentQuote.verse}</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance leading-relaxed italic">
          "{currentQuote.text}"
        </h2>
        <div className="flex gap-2 justify-center flex-wrap">
          <span className="bg-[#B4D700] text-[#2B2015] px-4 py-2 rounded-full font-semibold text-sm">
            {currentQuote.theme}
          </span>
          <span className="bg-[#FF6B35] text-white px-4 py-2 rounded-full font-semibold text-sm">Divine Wisdom</span>
        </div>
        <div className="flex gap-2 justify-center mt-6">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuoteIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentQuoteIndex ? "bg-[#FF6B35] w-8" : "bg-white/30 w-2 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
