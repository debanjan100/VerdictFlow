"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp, BarChart2, Activity, Target } from "lucide-react"

const MONTHLY_DATA = [
  { month: "Oct", cases: 4,  verified: 3  },
  { month: "Nov", cases: 6,  verified: 5  },
  { month: "Dec", cases: 5,  verified: 4  },
  { month: "Jan", cases: 9,  verified: 7  },
  { month: "Feb", cases: 12, verified: 10 },
  { month: "Mar", cases: 10, verified: 8  },
  { month: "Apr", cases: 14, verified: 11 },
]

const COMPLIANCE_DATA = [
  { month: "Oct", rate: 75 }, { month: "Nov", rate: 83 },
  { month: "Dec", rate: 80 }, { month: "Jan", rate: 78 },
  { month: "Feb", rate: 83 }, { month: "Mar", rate: 80 },
  { month: "Apr", rate: 94 },
]

const DEPT_RADAR = [
  { dept: "Revenue",     score: 85 },
  { dept: "Health",      score: 72 },
  { dept: "PWD",         score: 90 },
  { dept: "Environment", score: 68 },
  { dept: "Education",   score: 95 },
  { dept: "Finance",     score: 78 },
]

const TOOLTIP_STYLE = {
  background: "hsl(222 47% 10%)",
  border: "1px solid hsl(217 39% 19%)",
  borderRadius: 12,
  fontSize: 12,
}

const TICK_STYLE = { fontSize: 11, fill: "hsl(220 27% 63%)" }

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
}

interface ChartCardProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  badge?: { label: string; className: string }
  children: React.ReactNode
  delay?: number
}

function ChartCard({ title, subtitle, icon, badge, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 250, damping: 22 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance metrics and compliance tracking.</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Processed",  value: "60",  delta: "+55%",  color: "text-blue-400",    bg: "bg-blue-500/10"    },
          { label: "Compliance Rate",  value: "94%", delta: "+14%",  color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Avg. Review Time", value: "2.4d",delta: "-18%",  color: "text-amber-400",   bg: "bg-amber-500/10"   },
          { label: "Escalations",      value: "3",   delta: "-40%",  color: "text-red-400",     bg: "bg-red-500/10"     },
        ].map(({ label, value, delta, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl border border-border p-5 ${bg}`}
          >
            <p className="text-xs text-muted-foreground mb-2">{label}</p>
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{delta} vs last quarter</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar chart */}
        <ChartCard
          title="Cases Processed Per Month"
          subtitle="Total intake vs verified"
          icon={<BarChart2 className="h-4 w-4" />}
          badge={{ label: "+55% Apr", className: "bg-emerald-500/15 text-emerald-400" }}
          delay={0.1}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#f0f4ff" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(220 27% 63%)" }} />
              <Bar dataKey="cases"    name="Processed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="verified" name="Verified"  fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line chart */}
        <ChartCard
          title="Compliance Rate Over Time"
          subtitle="Monthly verification success %"
          icon={<TrendingUp className="h-4 w-4" />}
          badge={{ label: "94% this month", className: "bg-blue-500/15 text-blue-400" }}
          delay={0.18}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLIANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={TICK_STYLE} domain={[60, 100]} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#f0f4ff" }} formatter={(v: any) => [`${v}%`, "Rate"]} />
              <Line
                type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5}
                dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#fbbf24", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar chart */}
        <ChartCard
          title="Department Performance"
          subtitle="Compliance score by department"
          icon={<Target className="h-4 w-4" />}
          delay={0.26}
        >
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={DEPT_RADAR} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: "hsl(220 27% 63%)" }} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#f0f4ff" }} formatter={(v: any) => [`${v}%`, "Score"]} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity summary */}
        <ChartCard
          title="Activity Summary"
          subtitle="Case status breakdown"
          icon={<Activity className="h-4 w-4" />}
          delay={0.34}
        >
          <div className="space-y-3 mt-2">
            {[
              { label: "Verified",      value: 35, total: 60, color: "bg-emerald-500" },
              { label: "Pending Review",value: 15, total: 60, color: "bg-amber-500"   },
              { label: "In Review",     value: 7,  total: 60, color: "bg-blue-500"    },
              { label: "Escalated",     value: 3,  total: 60, color: "bg-red-500"     },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value} <span className="text-muted-foreground font-normal">/ {total}</span></span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
