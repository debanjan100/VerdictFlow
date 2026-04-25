"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCircle2, Clock, Upload, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "extraction" | "deadline" | "approval" | "alert"
  title: string
  message: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "extraction",
    title: "New Extraction Complete",
    message: "WP(C) 4821/2024 — AI extraction finished. Ready for review.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "deadline",
    title: "Deadline Approaching",
    message: "OA 765/2024 deadline passed. Contempt proceedings risk.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n3",
    type: "approval",
    title: "Case Verified",
    message: "CWP 11203/2024 has been approved and marked verified.",
    time: "3 hr ago",
    read: false,
  },
  {
    id: "n4",
    type: "alert",
    title: "Escalation Required",
    message: "MA 4512/2024 — 5 days to NGT hearing. Action pending.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n5",
    type: "extraction",
    title: "Upload Received",
    message: "WP 6644/2024 uploaded by Officer Portal. Processing started.",
    time: "Yesterday",
    read: true,
  },
]

const typeStyles = {
  extraction: { icon: Upload,        color: "text-blue-400",   bg: "bg-blue-500/10" },
  deadline:   { icon: Clock,         color: "text-red-400",    bg: "bg-red-500/10"  },
  approval:   { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  alert:      { icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/10" },
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "relative flex items-center justify-center h-9 w-9 rounded-xl border border-border transition-all duration-200",
          open ? "bg-primary/10 border-primary/40" : "bg-secondary/50 hover:bg-secondary hover:border-border/80"
        )}
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full font-bold">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  All caught up! 🎉
                </div>
              ) : (
                notifications.map(n => {
                  const { icon: Icon, color, bg } = typeStyles[n.type]
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors group",
                        !n.read && "bg-blue-500/5"
                      )}
                    >
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", bg)}>
                        <Icon className={cn("h-4 w-4", color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border text-center">
              <button className="text-xs text-primary hover:underline">View all notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
