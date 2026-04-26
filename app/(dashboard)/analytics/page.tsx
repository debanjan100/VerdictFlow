"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from "recharts"
import { 
  Loader2, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  FileText, Activity, Users, ArrowUpRight, ArrowDownRight 
} from "lucide-react"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  verified: '#10b981',
  archived: '#94a3b8'
}
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#10b981'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [deptData, setDeptData] = useState<any[]>([])
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [recentCases, setRecentCases] = useState<any[]>([])

  const supabase = createClient()

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [casesRes, actionsRes] = await Promise.all([ 
        supabase.from('cases').select('*').order('created_at', { ascending: false }), 
        supabase.from('compliance_actions').select('*'), 
      ]); 
  
      const cases = casesRes.data ?? []; 
      const actions = actionsRes.data ?? []; 
  
      // Compute stats
      const computedStats = { 
        total: cases.length, 
        pending: cases.filter(c => c.status === 'pending').length, 
        verified: cases.filter(c => c.status === 'verified').length, 
        processing: cases.filter(c => c.status === 'processing').length, 
        highPriority: cases.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length, 
        overdueActions: actions.filter(a => 
          a.deadline && new Date(a.deadline) < new Date() && a.status !== 'completed' && a.status !== 'done'
        ).length, 
        completedActions: actions.filter(a => a.status === 'completed' || a.status === 'done').length, 
        totalActions: actions.length
      }; 
  
      // Department breakdown
      const deptMap: Record<string, number> = {}; 
      cases.forEach(c => { 
        if (c.department) deptMap[c.department] = (deptMap[c.department] ?? 0) + 1; 
      }); 
      const computedDeptData = Object.entries(deptMap) 
        .map(([name, count]) => ({ name, count })) 
        .sort((a, b) => b.count - a.count);
  
      // Timeline data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const computedTimelineData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cases: cases.filter(c => c.created_at?.startsWith(date)).length,
        actions: actions.filter(a => a.created_at?.startsWith(date)).length
      }));

      setStats(computedStats); 
      setDeptData(computedDeptData); 
      setTimelineData(computedTimelineData);
      setRecentCases(cases.slice(0, 5));
    } catch (err: any) { 
      console.error('Analytics fetch error:', err); 
      setError(err.message); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-blue-500 mb-4" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-medium"
        >
          Compiling legal intelligence...
        </motion.p>
      </div>
    )
  }

  if (error) return <div className="p-8 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 m-6">Error: {error}</div>

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 p-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Analytics Insight</h1>
          <p className="text-muted-foreground mt-2 text-lg">Predictive intelligence and compliance performance.</p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border text-sm font-medium">
            <Activity className="h-4 w-4 text-blue-400" />
            Live System Status: <span className="text-emerald-400">Optimal</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Cases", value: stats.total, icon: FileText, color: "blue", trend: "+12%" },
          { label: "Total Actions", value: stats.totalActions, icon: Activity, color: "amber", trend: "+5%" },
          { label: "Compliance Rate", value: stats.totalActions > 0 ? Math.round((stats.completedActions / stats.totalActions) * 100) + "%" : "0%", icon: CheckCircle2, color: "emerald", trend: "+2%" },
          { label: "Critical Risks", value: stats.highPriority, icon: AlertTriangle, color: "red", trend: "-3%" }
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-3xl border border-border bg-card shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${kpi.color}-500/10 rounded-full blur-2xl group-hover:bg-${kpi.color}-500/20 transition-colors`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-400`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
            <p className="text-3xl font-black mt-1">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timeline Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 p-8 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl">Activity Timeline</h3>
            <select className="bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '12px' }}
                />
                <Area type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
                <Area type="monotone" dataKey="actions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Pie */}
        <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-border bg-card shadow-sm">
          <h3 className="font-bold text-xl mb-8">Status Distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
                    { name: 'Processing', value: stats.processing, color: STATUS_COLORS.processing },
                    { name: 'Verified', value: stats.verified, color: STATUS_COLORS.verified },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {[
                    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
                    { name: 'Processing', value: stats.processing, color: STATUS_COLORS.processing },
                    { name: 'Verified', value: stats.verified, color: STATUS_COLORS.verified },
                  ].filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Bar Chart */}
        <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-border bg-card shadow-sm">
          <h3 className="font-bold text-xl mb-8">Department Load</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Cases Table */}
        <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">Recent Activity</h3>
            <button className="text-blue-400 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentCases.map((c, idx) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full bg-${c.priority === 'CRITICAL' || c.priority === 'HIGH' ? 'red' : 'blue'}-500`} />
                  <div>
                    <p className="font-bold text-sm line-clamp-1">{c.title || 'Untitled Judgment'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.case_number || 'No Case #'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-secondary border border-border">{c.status}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
            {recentCases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No recent activity detected.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

