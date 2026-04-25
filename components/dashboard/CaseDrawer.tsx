"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, User, FileText, Clock, ExternalLink, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CaseTimeline } from "@/components/dashboard/CaseTimeline"
import { cn } from "@/lib/utils"
import type { MockCase } from "@/lib/mockData"

// Database case type
interface DatabaseCase {
  id: string
  case_number: string | null
  case_title: string | null
  court_name: string | null
  judgment_date: string | null
  pdf_filename: string
  pdf_url: string
  status: string
  created_at: string
  updated_at: string
  priority: string
  departments?: {
    name: string
  } | null
  users?: {
    full_name: string | null
  } | null
}

function countdown(createdAt: string) {
  // Since we don't have deadline in DB, use created_at + 30 days as mock deadline
  const mockDeadline = new Date(createdAt)
  mockDeadline.setDate(mockDeadline.getDate() + 30)
  const diff = mockDeadline.getTime() - Date.now()
  if (diff <= 0) return { label: "Overdue", urgent: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return { label: "Due Today", urgent: true }
  if (days === 1) return { label: "1 day left", urgent: true }
  return { label: `${days} days left`, urgent: days < 7 }
}

interface CaseDrawerProps {
  caseData: DatabaseCase | null
  onClose: () => void
}

export function CaseDrawer({ caseData, onClose }: CaseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  // Trap focus and prevent body scroll
  useEffect(() => {
    if (caseData) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [caseData])

  const cd = caseData ? countdown(caseData.created_at) : null

  return (
    <AnimatePresence>
      {caseData && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={caseData.status} size="sm" />
                  <StatusBadge status={caseData.priority} size="sm" />
                </div>
                <h2 className="text-lg font-bold leading-tight">{caseData.case_number || "Case Details"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{caseData.case_title || "Untitled Case"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "Court", value: caseData.court_name || "Unknown" },
                  { icon: FileText, label: "Department", value: caseData.departments?.name || "Unassigned" },
                  { icon: Calendar, label: "Filed", value: caseData.judgment_date ? new Date(caseData.judgment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A" },
                  { icon: User, label: "Uploaded by", value: caseData.users?.full_name || "Unknown" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg bg-secondary/50 border border-border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
                    </div>
                    <p className="text-sm font-medium leading-tight">{value}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Case Timeline</h3>
                <CaseTimeline createdAt={caseData.created_at} />
              </div>

              {/* PDF Link */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30">
                <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Original Judgment</p>
                  <p className="text-sm font-medium">{caseData.pdf_filename}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={caseData.pdf_url} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </a>
                </Button>
              </div>

              {/* Case Timeline */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Case Timeline</h3>
                <CaseTimeline createdAt={caseData.created_at} />
              </div>

              {/* PDF Link */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30">
                <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Original Judgment</p>
                  <p className="text-sm font-medium">{caseData.pdf_filename}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={caseData.pdf_url} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
