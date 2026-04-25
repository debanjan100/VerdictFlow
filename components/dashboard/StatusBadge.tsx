"use client"

import { cn } from "@/lib/utils"

export type StatusType =
  | "pending"
  | "pending_review"
  | "verified"
  | "escalated"
  | "in_review"
  | "overdue"
  | "processing"
  | "extracted"
  | "rejected"
  | "high"
  | "medium"
  | "low"
  | "critical"

const statusConfig: Record<
  StatusType,
  { label: string; className: string; pulse?: boolean }
> = {
  pending:        { label: "Pending",      className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  pending_review: { label: "Pending",      className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  verified:       { label: "Verified",     className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  escalated:      { label: "Escalated",    className: "bg-red-500/15 text-red-400 border border-red-500/30" },
  in_review:      { label: "In Review",    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  overdue:        { label: "Overdue",      className: "bg-red-500/20 text-red-400 border border-red-500/40", pulse: true },
  processing:     { label: "Processing",   className: "bg-slate-500/15 text-slate-400 border border-slate-500/30" },
  extracted:      { label: "Extracted",    className: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" },
  rejected:       { label: "Rejected",     className: "bg-rose-500/15 text-rose-400 border border-rose-500/30" },
  high:           { label: "High",         className: "bg-red-500/15 text-red-400 border border-red-500/30" },
  critical:       { label: "Critical",     className: "bg-red-600/20 text-red-300 border border-red-500/40", pulse: true },
  medium:         { label: "Medium",       className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  low:            { label: "Low",          className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
}

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
  size?: "sm" | "md"
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        config.className,
        config.pulse && "badge-overdue",
        className
      )}
    >
      {config.label}
    </span>
  )
}
