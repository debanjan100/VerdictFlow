"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, User, FileText, Clock, ExternalLink, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CaseTimeline } from "@/components/dashboard/CaseTimeline"
import { cn } from "@/lib/utils"
import type { MockCase } from "@/lib/mockData"

function countdown(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { label: "Overdue", urgent: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return { label: "Due Today", urgent: true }
  if (days === 1) return { label: "1 day left", urgent: true }
  return { label: `${days} days left`, urgent: days < 7 }
}

interface CaseDrawerProps {
  caseData: MockCase | null
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

  const cd = caseData ? countdown(caseData.deadline) : null

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
                <h2 className="text-lg font-bold leading-tight">{caseData.case_number}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{caseData.case_title}</p>
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
                  { icon: Building2, label: "Court",     value: caseData.court },
                  { icon: FileText,  label: "Department", value: caseData.department },
                  { icon: Calendar,  label: "Filed",      value: new Date(caseData.date_filed).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  { icon: User,      label: "Officer",    value: caseData.assigned_officer },
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

              {/* Deadline */}
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border",
                cd?.urgent
                  ? "border-red-500/40 bg-red-500/10"
                  : "border-border bg-secondary/30"
              )}>
                <Clock className={cn("h-5 w-5 shrink-0", cd?.urgent ? "text-red-400" : "text-muted-foreground")} />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Deadline</p>
                  <p className={cn("text-sm font-bold", cd?.urgent ? "text-red-400" : "text-foreground")}>
                    {new Date(caseData.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    &nbsp;— {cd?.label}
                  </p>
                </div>
              </div>

              {/* Action Summary */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Action Summary</h3>
                <p className="text-sm leading-relaxed text-foreground/90 bg-secondary/30 p-4 rounded-lg border border-border">
                  {caseData.action_summary}
                </p>
              </div>

              {/* Compliance Actions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Compliance Actions ({caseData.compliance_actions.length})
                </h3>
                <ul className="space-y-2">
                  {caseData.compliance_actions.map((action, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-2.5 text-sm p-3 rounded-lg bg-blue-500/5 border border-blue-500/15"
                    >
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Case Timeline */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Case Timeline</h3>
                <CaseTimeline createdAt={caseData.created_at} />
              </div>

              {/* PDF Preview placeholder */}
              <div className="rounded-xl border border-border bg-secondary/20 p-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">{caseData.pdf_filename}</p>
                <p className="text-xs text-muted-foreground mb-3">PDF Judgment Document</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open PDF
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
