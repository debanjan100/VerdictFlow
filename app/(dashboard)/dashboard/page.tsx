"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Scale, FileText, CheckCircle, AlertTriangle, Clock,
  TrendingUp, Activity, Zap, ArrowUpRight,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { createBrowserClient } from "@supabase/ssr"
import { useCountUp } from "@/hooks/useCountUp"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { SkeletonStatCard } from "@/components/dashboard/SkeletonCard"
import { MOCK_CASES } from "@/lib/mockData"
import { cn } from "@/lib/utils"

/* ─── Chart data ─── */
const CASES_OVER_TIME = [
  { month: "Nov", cases: 3 },  { month: "Dec", cases: 5 },
  { month: "Jan", cases: 8 },  { month: "Feb", cases: 11 },
  { month: "Mar", cases: 9 },  { month: "Apr", cases: 14 },
]

const DEPT_DATA = [
  { name: "Revenue",     value: 3, color: "#3b82f6" },
  { name: "Health",      value: 2, color: "#f59e0b" },
  { name: "PWD",         value: 2, color: "#22c55e" },
  { name: "Environment", value: 1, color: "#ef4444" },
  { name: "Other",       value: 2, color: "#8b5cf6" },
]

const RECENT_ACTIVITY = [
  { id: 1, event: "WP(C) 4821/2024 extracted by AI",          time: "2 min ago",  type: "extraction" },
  { id: 2, event: "CWP 11203/2024 verified by Sr. Ranjit",    time: "1 hr ago",   type: "verified"   },
  { id: 3, event: "MA 4512/2024 escalated — urgent review",   time: "3 hr ago",   type: "escalated"  },
  { id: 4, event: "OA 765/2024 deadline passed (OVERDUE)",    time: "Yesterday",  type: "overdue"    },
  { id: 5, event: "WP 6644/2024 uploaded for processing",     time: "Yesterday",  type: "uploaded"   },
]

const activityStyles: Record<string, string> = {
  extraction: "bg-blue-500/15 text-blue-400",
  verified:   "bg-emerald-500/15 text-emerald-400",
  escalated:  "bg-red-500/15 text-red-400",
  overdue:    "bg-red-600/20 text-red-300",
  uploaded:   "bg-slate-500/15 text-slate-400",
}

/* ─── Stat Card ─── */
interface StatCardProps {
  label: string
  value: number
  suffix?: string
  description: string
  icon: React.ReactNode
  gradient: string
  glowColor: string
  delay?: number
}

function StatCard({ label, value, suffix = "", description, icon, gradient, glowColor, delay = 0 }: StatCardProps) {
  const count = useCountUp(value, 1200)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ y: -3, boxShadow: `0 20px 40px ${glowColor}` }}
      className="rounded-2xl border border-border bg-card p-5 cursor-default transition-shadow group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", gradient)}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight mb-1">
        {count}{suffix}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </motion.div>
  )
}

/* ─── Custom tooltip ─── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value} cases</p>
    </div>
  )
}

/* ─── Page ─── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({ total: 0, pending: 0, critical: 0, compliance: 94 })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ count: total }, { count: pending }] = await Promise.all([
          supabase.from("cases").select("*", { count: "exact", head: true }),
          supabase.from("cases").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
        ])
        setStats({
          total:      (total ?? 0)   + MOCK_CASES.length,
          pending:    (pending ?? 0) + MOCK_CASES.filter(c => c.status === "pending_review").length,
          critical:   MOCK_CASES.filter(c => new Date(c.deadline) < new Date(Date.now() + 7 * 86400000)).length,
          compliance: 94,
        })
      } catch {
        setStats({
          total:      MOCK_CASES.length,
          pending:    MOCK_CASES.filter(c => c.status === "pending_review").length,
          critical:   MOCK_CASES.filter(c => new Date(c.deadline) < new Date(Date.now() + 7 * 86400000)).length,
          compliance: 94,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const upcomingDeadlines = MOCK_CASES
    .filter(c => new Date(c.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4)

  const verifiedCases = MOCK_CASES.filter(c => c.status === "verified").slice(0, 5)

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Live</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor court judgment extractions and action plans.</p>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Cases"
            value={stats.total}
            description="Across all departments"
            icon={<Scale className="h-5 w-5 text-blue-400" />}
            gradient="bg-blue-500/15"
            glowColor="rgba(59,130,246,0.15)"
            delay={0}
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            description="Awaiting officer action"
            icon={<Clock className="h-5 w-5 text-amber-400" />}
            gradient="bg-amber-500/15"
            glowColor="rgba(245,158,11,0.15)"
            delay={0.08}
          />
          <StatCard
            label="Critical Deadlines"
            value={stats.critical}
            description="Within next 7 days"
            icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
            gradient="bg-red-500/15"
            glowColor="rgba(239,68,68,0.15)"
            delay={0.16}
          />
          <StatCard
            label="Compliance Rate"
            value={stats.compliance}
            suffix="%"
            description="Successfully verified plans"
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
            gradient="bg-emerald-500/15"
            glowColor="rgba(34,197,94,0.15)"
            delay={0.24}
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cases Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Cases Over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly processing volume</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                +55% this month
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CASES_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 27% 63%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220 27% 63%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#60a5fa", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Verified Action Plans table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold">Verified Action Plans</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Recently approved, ready for execution</p>
              </div>
              <a href="/cases" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    {["Case Number", "Title", "Department", "Status"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {verifiedCases.map((vc, i) => (
                    <motion.tr
                      key={vc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-blue-400">{vc.case_number}</td>
                      <td className="px-6 py-3 max-w-[160px] truncate text-xs">{vc.case_title}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{vc.department}</td>
                      <td className="px-6 py-3"><StatusBadge status={vc.status} size="sm" /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    activityStyles[item.type]?.split(" ")[1] ?? "text-muted-foreground"
                  )} />
                  <p className="text-sm flex-1">{item.event}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-6">
          {/* Department Overview donut */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-1">Department Overview</h3>
            <p className="text-xs text-muted-foreground mb-4">Cases by department</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={DEPT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {DEPT_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 10%)", border: "1px solid hsl(217 39% 19%)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "#f0f4ff" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span style={{ fontSize: 11, color: "hsl(220 27% 63%)" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((c, i) => {
                const diff  = new Date(c.deadline).getTime() - Date.now()
                const days  = Math.floor(diff / 86400000)
                const urgent = days < 7
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.07 }}
                    className={cn(
                      "p-3 rounded-xl border text-xs",
                      urgent ? "border-red-500/30 bg-red-500/5" : "border-border bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-semibold text-blue-400">{c.case_number}</span>
                      <span className={cn("font-bold", urgent ? "text-red-400" : "text-amber-400")}>
                        {days === 0 ? "Today" : `${days}d`}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{c.case_title}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Pending Reviews list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-1">Pending Reviews</h3>
            <p className="text-xs text-muted-foreground mb-4">Awaiting verification</p>
            <div className="space-y-3">
              {MOCK_CASES.filter(c => c.status === "pending_review").slice(0, 3).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.48 + i * 0.07 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 cursor-pointer border border-transparent hover:border-border transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{c.case_number}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.department}</p>
                  </div>
                  <StatusBadge status={c.priority} size="sm" />
                </motion.div>
              ))}
              {MOCK_CASES.filter(c => c.status === "pending_review").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Queue is empty 🎉</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
