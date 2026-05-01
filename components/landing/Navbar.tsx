"use client"

import { useState, useEffect } from "react"
import { Scale, Menu, X, Sun, Moon } from "lucide-react"
import { useAuthModal } from "@/hooks/useAuthModal"
import { useTheme } from "next-themes"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openModal } = useAuthModal()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

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
    <nav className={`fixed top-0 w-full z-[100] h-[72px] transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-background/60 border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all">
            <Scale className="text-white w-5 h-5" />
          </div>
          <span className="font-playfair font-black text-2xl tracking-tight text-foreground bg-clip-text">VerdictFlow</span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-10 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/80">
          <button onClick={() => scrollToSection('features')} className="hover:text-blue-500 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-500 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all">Intelligence</button>
          <button onClick={() => scrollToSection('pipeline')} className="hover:text-blue-500 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all">Pipeline</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-500 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all">Contact</button>
        </div>

        {/* Right Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button 
            onClick={() => openModal('login')}
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-400 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => openModal('signup')}
            className="h-11 px-6 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[68px] left-0 w-full bg-background border-b border-border p-4 flex flex-col space-y-4 md:hidden shadow-xl">
          <button onClick={() => scrollToSection('features')} className="text-left text-muted-foreground hover:text-foreground py-2">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-left text-muted-foreground hover:text-foreground py-2">How It Works</button>
          <button onClick={() => scrollToSection('pipeline')} className="text-left text-muted-foreground hover:text-foreground py-2">Pipeline</button>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Theme</span>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>
          <hr className="border-border" />
          <button onClick={() => openModal('login')} className="w-full text-center py-2 text-amber-500 border border-border rounded-full">Log In</button>
          <button onClick={() => openModal('signup')} className="w-full text-center py-2 text-white bg-blue-600 rounded-full">Get Started</button>
        </div>
      )}
    </nav>
  )
}
