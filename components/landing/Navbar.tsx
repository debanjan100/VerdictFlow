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
    <nav className={`fixed top-0 w-full z-[100] h-[68px] transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-background/80 border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Scale className="text-white w-5 h-5" />
          </div>
          <span className="font-playfair font-bold text-xl tracking-wide text-foreground">VerdictFlow</span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">How It Works</button>
          <button onClick={() => scrollToSection('pipeline')} className="hover:text-foreground transition-colors">Pipeline</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-foreground transition-colors">Contact</button>
        </div>

        {/* Right Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button 
            onClick={() => openModal('login')}
            className="px-5 py-2 text-sm font-medium text-amber-500 border border-border rounded-full hover:border-amber-500 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => openModal('signup')}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(26,111,216,0.5)] transition-all"
          >
            Get Started →
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
