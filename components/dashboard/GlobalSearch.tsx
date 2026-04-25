"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, BarChart2, Upload, CheckSquare, ArrowRight, X } from "lucide-react"
import { MOCK_CASES } from "@/lib/mockData"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "case" | "page"
  title: string
  subtitle?: string
  href: string
  icon: React.ReactNode
}

const PAGES: SearchResult[] = [
  { id: "dashboard",      type: "page", title: "Dashboard",       subtitle: "Overview & stats",       href: "/dashboard",       icon: <BarChart2 className="h-4 w-4" /> },
  { id: "upload",         type: "page", title: "Upload Judgment", subtitle: "Upload a new PDF",       href: "/upload",          icon: <Upload className="h-4 w-4" /> },
  { id: "cases",          type: "page", title: "Cases Directory", subtitle: "Browse all cases",       href: "/cases",           icon: <FileText className="h-4 w-4" /> },
  { id: "pending-review", type: "page", title: "Pending Review",  subtitle: "Review queue",           href: "/pending-review",  icon: <CheckSquare className="h-4 w-4" /> },
  { id: "analytics",      type: "page", title: "Analytics",       subtitle: "Charts & reports",       href: "/analytics",       icon: <BarChart2 className="h-4 w-4" /> },
]

export function GlobalSearch() {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState("")
  const [idx, setIdx]     = useState(0)
  const router = useRouter()

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => { if (!open) setQuery("") }, [open])

  const results: SearchResult[] = query.trim() === ""
    ? PAGES
    : [
        ...PAGES.filter(p =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (p.subtitle ?? "").toLowerCase().includes(query.toLowerCase())
        ),
        ...MOCK_CASES
          .filter(c =>
            c.case_number.toLowerCase().includes(query.toLowerCase()) ||
            c.case_title.toLowerCase().includes(query.toLowerCase()) ||
            c.court.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map<SearchResult>(c => ({
            id: c.id,
            type: "case",
            title: c.case_number,
            subtitle: c.case_title,
            href: "/cases",
            icon: <FileText className="h-4 w-4" />,
          })),
      ]

  const navigate = useCallback((result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
  }, [router])

  useEffect(() => {
    setIdx(0)
  }, [query])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && results[idx]) navigate(results[idx])
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg bg-secondary/50 hover:bg-secondary hover:border-border/80 transition-all"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.18, type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Search cases, pages, officers..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={() => setQuery("")}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono border border-border text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {results.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(r)}
                      onMouseEnter={() => setIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        i === idx ? "bg-primary/10" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        r.type === "case" ? "bg-blue-500/15 text-blue-400" : "bg-secondary text-muted-foreground"
                      )}>
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                      </div>
                      <ArrowRight className={cn("h-4 w-4 shrink-0 transition-opacity", i === idx ? "opacity-100 text-primary" : "opacity-0")} />
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-secondary rounded border border-border font-mono">↑↓</kbd>navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-secondary rounded border border-border font-mono">↵</kbd>open</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-secondary rounded border border-border font-mono">esc</kbd>close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
