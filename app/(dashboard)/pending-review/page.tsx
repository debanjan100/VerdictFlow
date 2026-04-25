"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, XCircle, Filter, Clock, AlertTriangle,
  CheckSquare, Square, Trash2, Inbox,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { MOCK_CASES, type MockCase } from "@/lib/mockData"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Helpers ─── */
function getDaysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  const days = Math.floor(diff / 86400000)
  if (diff <= 0)  return { label: "OVERDUE",   urgent: true,  days: -1 }
  if (days === 0) return { label: "Due Today", urgent: true,  days: 0  }
  if (days === 1) return { label: "1 day left", urgent: true, days: 1  }
  return { label: `${days} days left`, urgent: days < 7, days }
}

/* ─── Review Card ─── */
function ReviewCard({
  c, checked, onToggle, onApprove, onRevision,
}: {
  c: MockCase
  checked: boolean
  onToggle: () => void
  onApprove: () => void
  onRevision: () => void
}) {
  const dl = getDaysLeft(c.deadline)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl border bg-card p-5 space-y-4 transition-all duration-200",
        checked ? "border-blue-500/50 bg-blue-500/5" : "border-border hover:border-border/80"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
          >
            {checked
              ? <CheckSquare className="h-5 w-5 text-blue-400" />
              : <Square className="h-5 w-5 text-muted-foreground" />}
          </button>
          <div>
            <p className="font-mono text-sm font-bold text-blue-400">{c.case_number}</p>
            <p className="text-sm font-semibold mt-0.5 leading-tight">{c.case_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={c.priority} size="sm" />
          <StatusBadge status={c.department.toLowerCase() as any} size="sm" className="bg-slate-500/15 text-slate-400 border-slate-500/30" />
        </div>
      </div>

      {/* Action summary */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pl-8">
        {c.action_summary}
      </p>

      {/* Compliance actions preview */}
      <div className="pl-8 space-y-1.5">
        {c.compliance_actions.slice(0, 2).map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="h-4 w-4 rounded-full bg-blue-500/15 text-blue-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
            <span className="text-muted-foreground line-clamp-1">{a}</span>
          </div>
        ))}
        {c.compliance_actions.length > 2 && (
          <p className="text-[11px] text-muted-foreground pl-6">+{c.compliance_actions.length - 2} more actions</p>
        )}
      </div>

      {/* Deadline + court */}
      <div className="flex items-center justify-between pl-8 gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className={cn("h-3.5 w-3.5 shrink-0", dl.urgent ? "text-red-400" : "text-muted-foreground")} />
          <span className={cn("text-xs font-semibold", dl.urgent ? "text-red-400" : "text-muted-foreground")}>
            {dl.label}
          </span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground">
            {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{c.court}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pl-8 pt-1">
        <Button
          size="sm"
          onClick={onApprove}
          className="gap-2 h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white flex-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve & Verify
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRevision}
          className="gap-2 h-8 text-xs rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-1"
        >
          <XCircle className="h-3.5 w-3.5" />
          Request Revision
        </Button>
      </div>
    </motion.div>
  )
}

/* ─── Page ─── */
export default function PendingReviewPage() {
  const initialQueue = MOCK_CASES.filter(c =>
    c.status === "pending_review" || c.status === "in_review"
  )

  const [queue,     setQueue]     = useState<MockCase[]>(initialQueue)
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [priorityF, setPriorityF] = useState("")
  const [deptF,     setDeptF]     = useState("")

  const stats = useMemo(() => ({
    total:    queue.length,
    high:     queue.filter(c => c.priority === "high" || c.priority === "critical").length,
    dueToday: queue.filter(c => {
      const diff = new Date(c.deadline).getTime() - Date.now()
      return diff >= 0 && diff < 86400000
    }).length,
    overdue:  queue.filter(c => new Date(c.deadline).getTime() < Date.now()).length,
  }), [queue])

  const filtered = useMemo(() => {
    let rows = [...queue]
    if (priorityF) rows = rows.filter(c => c.priority === priorityF)
    if (deptF)     rows = rows.filter(c => c.department === deptF)
    // Sort: critical/overdue first
    rows.sort((a, b) => {
      const pA = a.priority === "critical" ? 0 : a.priority === "high" ? 1 : 2
      const pB = b.priority === "critical" ? 0 : b.priority === "high" ? 1 : 2
      return pA - pB
    })
    return rows
  }, [queue, priorityF, deptF])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const approve = (id: string) => {
    setQueue(q => q.filter(c => c.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    toast.success("Case approved and verified ✅")
  }

  const revision = (id: string) => {
    setQueue(q => q.filter(c => c.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    toast.info("Revision request sent 📝")
  }

  const bulkApprove = () => {
    const ids = Array.from(selected)
    setQueue(q => q.filter(c => !ids.includes(c.id)))
    setSelected(new Set())
    toast.success(`${ids.length} cases approved & verified ✅`)
  }

  const toggleAll = () => {
    if (selected.size === filtered.length)
      setSelected(new Set())
    else
      setSelected(new Set(filtered.map(c => c.id)))
  }
  const departments = Array.from(new Set(queue.map(c => c.department)))

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Pending Review</h1>
        <p className="text-muted-foreground mt-1">Review, approve, or request revisions for extracted judgments.</p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Total Pending",  value: stats.total,    icon: Inbox,         bg: "bg-blue-500/10",    text: "text-blue-400"    },
          { label: "High Priority",  value: stats.high,     icon: AlertTriangle, bg: "bg-red-500/10",     text: "text-red-400"     },
          { label: "Due Today",      value: stats.dueToday, icon: Clock,         bg: "bg-amber-500/10",   text: "text-amber-400"   },
          { label: "Overdue",        value: stats.overdue,  icon: XCircle,       bg: "bg-rose-600/10",    text: "text-rose-400"    },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className={cn("rounded-2xl border border-border p-4 flex items-center gap-3", bg + "/20")}>
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-5 w-5", text)} />
            </div>
            <div>
              <p className={cn("text-2xl font-extrabold", text)}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter:
        </div>
        {[
          { label: "All Priority", value: priorityF, onChange: setPriorityF, options: ["critical","high","medium","low"] },
          { label: "All Depts",    value: deptF,     onChange: setDeptF,     options: departments },
        ].map(({ label, value, onChange, options }) => (
          <select
            key={label}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {(priorityF || deptF) && (
          <Button variant="ghost" size="sm" onClick={() => { setPriorityF(""); setDeptF("") }}
            className="text-xs text-muted-foreground h-9 px-3 rounded-xl">
            Clear
          </Button>
        )}

        {/* Select all */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs h-9 gap-2 rounded-xl">
            {selected.size === filtered.length && filtered.length > 0
              ? <><CheckSquare className="h-4 w-4" /> Deselect All</>
              : <><Square className="h-4 w-4" /> Select All</>}
          </Button>
        </div>
      </motion.div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Queue is clear!</h3>
          <p className="text-sm text-muted-foreground">All pending reviews have been processed.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filtered.map(c => (
              <ReviewCard
                key={c.id}
                c={c}
                checked={selected.has(c.id)}
                onToggle={() => toggleSelect(c.id)}
                onApprove={() => approve(c.id)}
                onRevision={() => revision(c.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Sticky bulk actions bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card border border-border rounded-2xl px-6 py-3.5 shadow-2xl z-40"
          >
            <span className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold">{selected.size}</span> selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Button
              size="sm"
              onClick={bulkApprove}
              className="gap-2 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-9 rounded-xl text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
