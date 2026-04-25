"use client"

import { useState, useEffect } from "react"
import { Scale, Menu, X } from "lucide-react"
import { useAuthModal } from "@/hooks/useAuthModal"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openModal } = useAuthModal()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`fixed top-0 w-full z-[100] h-[68px] transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-[rgba(8,12,20,0.85)] border-b border-[var(--border)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--blue)] flex items-center justify-center shadow-lg">
            <Scale className="text-white w-5 h-5" />
          </div>
          <span className="font-playfair font-bold text-xl tracking-wide text-white">VerdictFlow</span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[var(--muted)]">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
          <button onClick={() => scrollToSection('pipeline')} className="hover:text-white transition-colors">Pipeline</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
        </div>

        {/* Right Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => openModal('login')}
            className="px-5 py-2 text-sm font-medium text-[var(--gold)] border border-[var(--border)] rounded-full hover:border-[var(--gold)] transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => openModal('signup')}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--blue)] to-[var(--blue2)] rounded-full hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(26,111,216,0.5)] transition-all"
          >
            Get Started →
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[68px] left-0 w-full bg-[var(--surface)] border-b border-[var(--border)] p-4 flex flex-col space-y-4 md:hidden shadow-xl">
          <button onClick={() => scrollToSection('features')} className="text-left text-[var(--muted)] hover:text-white py-2">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-left text-[var(--muted)] hover:text-white py-2">How It Works</button>
          <button onClick={() => scrollToSection('pipeline')} className="text-left text-[var(--muted)] hover:text-white py-2">Pipeline</button>
          <hr className="border-[var(--border)]" />
          <button onClick={() => openModal('login')} className="w-full text-center py-2 text-[var(--gold)] border border-[var(--border)] rounded-full">Log In</button>
          <button onClick={() => openModal('signup')} className="w-full text-center py-2 text-white bg-[var(--blue)] rounded-full">Get Started</button>
        </div>
      )}
    </nav>
  )
}
