import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import AuthModal from '@/components/auth/AuthModal'

export default function LandingPage() {
  return (
    <main className="bg-[#0a0f1e] min-h-screen text-white overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTASection />
      <Footer />
      <AuthModal />
    </main>
  )
}
