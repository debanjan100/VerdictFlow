"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Scale, FileText, CheckCircle, AlertTriangle, Clock,
  TrendingUp, Activity, Zap, ArrowUpRight, ArrowDownRight,
  Gavel, ShieldCheck, Building, Users, Search, Filter, RefreshCw
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/* ─── Modern Dashboard Redesign ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    critical: 0,
    compliance: 0,
    weeklyTrend: [] as any[],
    deptDistribution: [] as any[]
  })
  const [recentCases, setRecentCases] = useState<any[]>([])

  const supabase = createClient()

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [
        { data: cases, error: casesError },
        { data: actions, error: actionsError }
      ] = await Promise.all([
        supabase.from("cases").select("*").order("created_at", { ascending: false }),
        supabase.from("compliance_actions").select("*")
      ])

      if (casesError || actionsError) throw casesError || actionsError

      const total = cases?.length || 0
      const pending = cases?.filter(c => c.status === "pending").length || 0
      const critical = cases?.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length || 0
      
      const completedActions = actions?.filter(a => a.status === "completed" || a.status === "done").length || 0
      const totalActions = actions?.length || 0
      const compliance = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

      // Compute Dept Distribution
      const deptMap: Record<string, number> = {}
      cases?.forEach(c => {
        const dept = c.department || "Other"
        deptMap[dept] = (deptMap[dept] || 0) + 1
      })
      const deptDistribution = Object.entries(deptMap).map(([name, value]) => ({ name, value }))

      // Mock Weekly Trend (Last 7 days)
      const weeklyTrend = [
        { day: "Mon", cases: 4, actions: 12 },
        { day: "Tue", cases: 7, actions: 18 },
        { day: "Wed", cases: 5, actions: 15 },
        { day: "Thu", cases: 9, actions: 22 },
        { day: "Fri", cases: 12, actions: 30 },
        { day: "Sat", cases: 3, actions: 8 },
        { day: "Sun", cases: 2, actions: 5 },
      ]

      setStats({ total, pending, critical, compliance, weeklyTrend, deptDistribution })
      setRecentCases(cases?.slice(0, 5) || [])
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err)
      toast.error("Failed to sync live dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80">Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time oversight of judicial compliance and automated analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={refreshing}
            className="rounded-xl border-border bg-background/50 backdrop-blur-sm gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Sync Data
          </Button>
          <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20 gap-2">
            <Zap className="h-4 w-4" />
            Quick Analysis
          </Button>
        </div>
      </div>

      {/* High-Impact Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Judgments", value: stats.total, icon: Gavel, color: "blue", sub: "Live database" },
          { label: "Awaiting Review", value: stats.pending, icon: Clock, color: "amber", sub: "Manual verification" },
          { label: "Compliance Rate", value: stats.compliance, icon: ShieldCheck, color: "emerald", sub: "Action fulfillment", suffix: "%" },
          { label: "Risk Exposure", value: stats.critical, icon: AlertTriangle, color: "rose", sub: "High priority cases" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative group overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
          >
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity", `bg-${stat.color}-500`)} />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.sub}</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter">{stat.value}</span>
              {stat.suffix && <span className="text-xl font-bold text-muted-foreground">{stat.suffix}</span>}
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Analysis Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl border border-border bg-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">System Velocity</h3>
              <p className="text-sm text-muted-foreground font-medium">Processing volume & compliance speed</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Cases</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Actions</div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyTrend}>
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#primaryGradient)" />
                <Area type="monotone" dataKey="actions" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#emeraldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Breakdown */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card p-8">
          <h3 className="text-xl font-bold tracking-tight mb-2">Department Load</h3>
          <p className="text-sm text-muted-foreground font-medium mb-8">Workload distribution</p>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.deptDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.deptDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][index % 5]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Cases Section */}
      <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Recent Judgments</h3>
            <p className="text-sm text-muted-foreground font-medium">Latest extractions and analysis results</p>
          </div>
          <Button variant="ghost" className="rounded-xl text-primary font-bold hover:bg-primary/5">View All Cases</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Case Reference</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title / Summary</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Compliance</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentCases.map((c, i) => (
                <motion.tr 
                  key={c.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="hover:bg-muted/20 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                        {c.case_number?.slice(0, 2) || "WP"}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{c.case_number || "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-md">
                      <div className="font-bold text-sm line-clamp-1 mb-1">{c.title || "Untitled Judgment"}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{c.summary || "No summary extracted."}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-[11px] font-bold">
                      <Building className="h-3 w-3" />
                      {c.department || "General"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {recentCases.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Search className="h-12 w-12" />
                      <p className="text-sm font-bold uppercase tracking-widest">No judgment data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
