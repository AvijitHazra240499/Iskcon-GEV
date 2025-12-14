import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import QuoteCarousel from "@/components/quote-carousel"

const bhagavadGitaQuotes = [
  {
    verse: "2.47",
    text: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
    theme: "Duty & Service",
  },
  {
    verse: "3.19",
    text: "Therefore, without being attached to the fruits of activities, one should act as a matter of duty.",
    theme: "Selfless Action",
  },
  {
    verse: "10.27",
    text: "Of all creatures, I am the seed; there is no being, moving or unmoving, that can exist without Me.",
    theme: "Unity in Service",
  },
  {
    verse: "4.11",
    text: "As all surrender unto Me, I reward them accordingly. Everyone follows My path in all respects, O son of Pritha.",
    theme: "Divine Grace",
  },
  {
    verse: "18.46",
    text: "By worship of the Lord, all duties are perfectly fulfilled, for the Lord is the ultimate goal of all work.",
    theme: "True Purpose",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B2015] via-[#4A3F33] to-[#2B2015]">
      {/* Navigation */}
      <nav className="bg-[#2B2015] border-b-4 border-[#B4D700] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo-govardhan-circle.png"
                alt="Govardhan Annakshetra"
                className="w-12 h-12 rounded-full border-2 border-[#B4D700] shadow-lg"
              />
              <span className="text-white font-bold text-xl">Govardhan Annakshetra</span>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <Link href="#impact" className="text-white hover:text-[#B4D700] transition font-medium">
                About Us
              </Link>
              <Link href="/impact" className="text-white hover:text-[#B4D700] transition font-medium">
                Our Impact
              </Link>
              <Link href="/spiritual" className="text-white hover:text-[#B4D700] transition font-medium">
                Spiritual
              </Link>
              <Link href="/gallery" className="text-white hover:text-[#B4D700] transition font-medium">
                Gallery
              </Link>
            </div>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white hover:shadow-lg hover:scale-105 transition font-bold">
                ADMIN PANEL
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
              "To relieve{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#B4D700]">HUNGER</span>{" "}
              is a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B4D700] to-[#6B8C0A]">
                DIVINE SERVICE
              </span>
              "
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Be part of this sacred bond, nourish lives, empower communities through Langar, Annakshetra, and Village
              Seva at Govardhan Eco Village.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/impact">
                <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white px-8 py-6 text-lg font-bold hover:shadow-xl hover:scale-105 transition">
                  VIEW OUR IMPACT
                </Button>
              </Link>
              <Link href="/donations">
                <button className="border-2 border-[#B4D700] text-[#B4D700] px-8 py-6 text-lg font-bold hover:bg-[#B4D700]/10 rounded-lg transition">
                  DONATE NOW
                </button>
              </Link>
            </div>
            <p className="text-white/60 mt-8 text-sm animate-bounce">↓ scroll to explore</p>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-[#FF6B35] via-[#4A3F33] to-[#2B2015] rounded-xl border-4 border-[#B4D700] flex items-center justify-center shadow-2xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/82xrzt35MUY"
              title="Govardhan Annakshetra Food Distribution"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Bhagavad Gita Quote Carousel - Now rotates quotes automatically */}
      <QuoteCarousel quotes={bhagavadGitaQuotes} />

      {/* Quick Stats */}
      <section className="bg-[#2B2015]/50 backdrop-blur py-16 my-16 rounded-2xl mx-4 border-l-8 border-[#FF6B35] shadow-2xl">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">Quick Stats</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] border-0 hover:shadow-2xl hover:scale-105 transition">
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">10.2 Cr+</div>
                <p className="text-white/90 font-semibold">Prasadam Served</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-[#B4D700] to-[#6B8C0A] border-0 hover:shadow-2xl hover:scale-105 transition">
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-[#2B2015] mb-2">350+</div>
                <p className="text-[#2B2015]/90 font-semibold">Villages Helped</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] border-0 hover:shadow-2xl hover:scale-105 transition">
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">5000+</div>
                <p className="text-white/90 font-semibold">Active Volunteers</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-[#9333EA] to-[#7E22CE] border-0 hover:shadow-2xl hover:scale-105 transition">
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">15 Yrs</div>
                <p className="text-white/90 font-semibold">Of Continuous Seva</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">What We Do</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#2B2015] border-l-4 border-[#FF6B35] hover:shadow-xl transition">
            <div className="p-6">
              <div className="text-5xl mb-4">🍛</div>
              <h3 className="text-2xl font-bold text-[#FF6B35] mb-2">Langar</h3>
              <p className="text-white/80">
                Free food distribution to all regardless of caste, creed, or religion. Pure vegetarian prasadam served
                with divine love.
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#2B2015] border-l-4 border-[#B4D700] hover:shadow-xl transition">
            <div className="p-6">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold text-[#B4D700] mb-2">Annakshetra</h3>
              <p className="text-white/80">
                Sacred food distribution centers providing nutritious meals and spiritual nourishment to communities in
                need.
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-[#4A3F33] to-[#2B2015] border-l-4 border-[#1E3A8A] hover:shadow-xl transition">
            <div className="p-6">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-white mb-2">Village Seva</h3>
              <p className="text-white/80">
                Comprehensive outreach programs empowering rural communities through education, healthcare, and
                livelihood support.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#FF6B35] to-[#9333EA] py-20 rounded-3xl mx-4 mb-16 shadow-2xl">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to be part of Divine Service?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join our volunteer network or donate to help us serve more devotees and uplift communities
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/impact">
              <Button className="bg-white text-[#FF6B35] px-8 py-6 text-lg font-bold hover:scale-105 transition shadow-lg">
                VIEW OUR IMPACT
              </Button>
            </Link>
            <Link href="/donations">
              <button className="border-2 border-white text-white px-8 py-6 text-lg font-bold hover:bg-white/10 rounded-lg transition">
                DONATE NOW
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B2015] border-t-4 border-[#B4D700] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#B4D700]">✓</span>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link href="/" className="text-white/70 hover:text-[#B4D700] block transition">
                  Home
                </Link>
                <Link href="/impact" className="text-white/70 hover:text-[#B4D700] block transition">
                  Impact Dashboard
                </Link>
                <Link href="/spiritual" className="text-white/70 hover:text-[#B4D700] block transition">
                  Spiritual Hub
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#FF6B35]">✓</span>
                Activities
              </h3>
              <div className="space-y-2">
                <Link href="/gallery" className="text-white/70 hover:text-[#B4D700] block transition">
                  Seva Gallery
                </Link>
                <Link href="/donations" className="text-white/70 hover:text-[#B4D700] block transition">
                  Donation Transparency
                </Link>
                <Link href="/admin" className="text-white/70 hover:text-[#B4D700] block transition">
                  Admin Panel
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#1E3A8A]">✓</span>
                Contact
              </h3>
              <p className="text-white/70 text-sm mb-2">📧 seva@govardhan.org</p>
              <p className="text-white/70 text-sm">📱 +91-XXXX-XXX-XXX</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#9333EA]">✓</span>
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/govardhanecovillage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6B35] hover:text-[#B4D700] transition text-2xl"
                >
                  f
                </a>
                <a
                  href="https://www.instagram.com/iskcon_gev_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6B35] hover:text-[#B4D700] transition text-2xl"
                >
                  ⚫
                </a>
                <a
                  href="https://in.linkedin.com/company/govardhanecovillage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6B35] hover:text-[#B4D700] transition text-2xl"
                >
                  in
                </a>
                <a
                  href="https://www.youtube.com/channel/UCbYDmgE3dM1AsTIUGOBpkrQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6B35] hover:text-[#B4D700] transition text-2xl"
                >
                  ▶
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#6B5A4A] pt-8 text-center text-white/60 text-sm">
            <p>🙏 All Glories to Sri Guru and Gauranga | Govardhan Annakshetra © 2025 | Serving with Divine Love</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
