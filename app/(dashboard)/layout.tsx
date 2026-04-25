"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import {
  Scale, Home, Upload, FileText, CheckSquare,
  Settings, LogOut, Github, Linkedin, BarChart2,
  ChevronLeft, ChevronRight, Sun, Moon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import { NotificationCenter } from "@/components/dashboard/NotificationCenter"
import { GlobalSearch } from "@/components/dashboard/GlobalSearch"

const NAV_ITEMS = [
  { name: "Dashboard",       href: "/dashboard",      icon: Home,        badge: null },
  { name: "Upload Judgment", href: "/upload",          icon: Upload,      badge: null },
  { name: "Cases Directory", href: "/cases",           icon: FileText,    badge: null },
  { name: "Pending Review",  href: "/pending-review",  icon: CheckSquare, badge: "3"  },
  { name: "Analytics",       href: "/analytics",       icon: BarChart2,   badge: null },
  { name: "Settings",        href: "/settings",        icon: Settings,    badge: null },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode,  setDarkMode]  = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])
  const toggleCollapsed = () => {
    setCollapsed(c => {
      const next = !c
      localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }

  const userInitials = "OP"
  const userRole     = "Gov. Officer"
  const userName     = "Officer Portal"

  return (
    <div className="flex min-h-screen bg-background">
      {/* ──── SIDEBAR ──── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col border-r border-border bg-card relative shrink-0 overflow-hidden z-30"
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border shrink-0 overflow-hidden",
          collapsed ? "justify-center px-4" : "px-5"
        )}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="font-bold text-base tracking-tight whitespace-nowrap"
                >
                  VerdictFlow
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 group",
                    collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 gap-3",
                    isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-blue-500"
                    />
                  )}

                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "")} />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="flex-1 whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && (
                    <span className="ml-auto h-5 w-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover border border-border rounded-lg text-xs whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-3 shrink-0">
          {/* User avatar */}
          <div className={cn(
            "flex items-center rounded-xl p-2 bg-secondary/50 border border-border overflow-hidden",
            collapsed ? "justify-center" : "gap-3"
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userInitials}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold truncate">{userName}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-medium">
                    {userRole}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(d => !d)}
            title={collapsed ? (darkMode ? "Light Mode" : "Dark Mode") : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors",
              collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full"
            )}
          >
            {darkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
              collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Social links */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2 border-t border-border space-y-1"
              >
                {[
                  { href: "https://github.com/debanjan100", icon: Github, label: "GitHub", hoverColor: "hover:text-foreground" },
                  { href: "https://www.linkedin.com/in/debanjanghorui5567/", icon: Linkedin, label: "LinkedIn", hoverColor: "hover:text-[#0A66C2]" },
                ].map(({ href, icon: Icon, label, hoverColor }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground transition-colors rounded-lg hover:bg-secondary/50", hoverColor)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:bg-secondary transition-colors z-50"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
            : <ChevronLeft  className="h-3 w-3 text-muted-foreground" />}
        </button>
      </motion.aside>

      {/* ──── MAIN ──── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">VerdictFlow</span>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium">
              {NAV_ITEMS.find(i => pathname === i.href || pathname.startsWith(i.href + "/"))?.name ?? "VerdictFlow"}
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <GlobalSearch />
            <NotificationCenter />
            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold leading-tight">{userName}</p>
                <p className="text-[10px] text-muted-foreground">{userRole}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around py-2 px-2 z-30">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] transition-colors",
                  isActive ? "text-blue-400 bg-blue-500/10" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name.split(" ")[0]}</span>
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
