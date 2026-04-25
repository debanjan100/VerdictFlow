"use client"
import React from "react"

import { motion } from "framer-motion"
import { CheckCircle2, Upload, Eye, ShieldCheck, Gavel } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  label: string
  description?: string
  timestamp: string
  status: "done" | "active" | "pending"
  icon?: React.ReactNode
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { id: "1", label: "Uploaded",   description: "PDF judgment uploaded to system",       status: "done",    timestamp: "", icon: <Upload className="h-3.5 w-3.5" /> },
  { id: "2", label: "Extracted",  description: "AI extracted metadata & clauses",       status: "done",    timestamp: "", icon: <Gavel className="h-3.5 w-3.5" /> },
  { id: "3", label: "In Review",  description: "Assigned officer is reviewing",         status: "active",  timestamp: "", icon: <Eye className="h-3.5 w-3.5" /> },
  { id: "4", label: "Verified",   description: "Action plan approved",                  status: "pending", timestamp: "", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { id: "5", label: "Executed",   description: "Compliance actions carried out",        status: "pending", timestamp: "", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
]

interface CaseTimelineProps {
  events?: TimelineEvent[]
  createdAt?: string
}

export function CaseTimeline({ events, createdAt }: CaseTimelineProps) {
  const items = events ?? DEFAULT_EVENTS.map((e, i) => ({
    ...e,
    timestamp: i === 0 && createdAt
      ? new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "",
  }))

  return (
    <div className="relative space-y-0 pl-4">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border" />

      {items.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex gap-3 pb-5 relative"
        >
          {/* Icon circle */}
          <div className={cn(
            "relative z-10 flex items-center justify-center h-9 w-9 rounded-full border-2 shrink-0 mt-0.5",
            event.status === "done"    && "border-emerald-500 bg-emerald-500/15 text-emerald-400",
            event.status === "active"  && "border-blue-500 bg-blue-500/15 text-blue-400",
            event.status === "pending" && "border-border bg-card text-muted-foreground",
          )}>
            {event.status === "done"
              ? <CheckCircle2 className="h-4 w-4" />
              : event.icon ?? <div className="h-2 w-2 rounded-full bg-current" />}
          </div>

          {/* Content */}
          <div className="pt-1 min-h-[36px]">
            <p className={cn(
              "text-sm font-semibold leading-tight",
              event.status === "done"    && "text-foreground",
              event.status === "active"  && "text-blue-400",
              event.status === "pending" && "text-muted-foreground",
            )}>
              {event.label}
            </p>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            )}
            {event.timestamp && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{event.timestamp}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
