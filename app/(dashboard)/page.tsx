"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, FileText, CheckCircle, AlertTriangle, Clock, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, pending: 0, critical: 0, compliance: 94 })
  const [verifiedCases, setVerifiedCases] = useState<any[]>([])
  const [pendingCases, setPendingCases] = useState<any[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // In a real app, this would be a complex query or RPC call
    const fetchData = async () => {
      const { count: totalCount } = await supabase.from('cases').select('*', { count: 'exact', head: true })
      const { count: pendingCount } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')
      
      setStats(prev => ({ ...prev, total: totalCount || 0, pending: pendingCount || 0 }))

      const { data: vCases } = await supabase
        .from('cases')
        .select('*, action_plans(*)')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(5)
        
      if (vCases) setVerifiedCases(vCases)

      const { data: pCases } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })
        .limit(5)
        
      if (pCases) setPendingCases(pCases)
    }
    fetchData()
  }, [supabase])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor court judgment extractions and action plans.</p>
      </motion.div>

      {/* Top Stats Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cases Processed</CardTitle>
              <Scale className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className={\`border-l-4 shadow-sm hover:shadow-md transition-all h-full \${stats.pending > 5 ? 'border-l-destructive' : 'border-l-warning'}\`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className={\`h-4 w-4 \${stats.pending > 5 ? 'text-destructive' : 'text-warning'}\`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              {stats.pending > 5 ? (
                <p className="text-xs text-destructive font-medium">High backlog - Attention needed</p>
              ) : (
                <p className="text-xs text-muted-foreground">Action required soon</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Deadlines</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">Within next 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.compliance}%</div>
              <p className="text-xs text-muted-foreground">Successfully verified plans</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Left Column (65%) -> 2 spans out of 3 */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Verified Action Plans</CardTitle>
                <CardDescription>Recently approved plans ready for execution.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">Case Number</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedCases.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-4 text-muted-foreground">No verified cases yet</td></tr>
                      ) : (
                        verifiedCases.map((vc) => (
                          <tr key={vc.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => router.push(\`/cases/\${vc.id}/verify\`)}>
                            <td className="px-4 py-3 font-medium">{vc.case_number || 'Unknown'}</td>
                            <td className="px-4 py-3">
                              <Badge variant={vc.action_plans?.[0]?.priority_level === 'critical' ? 'destructive' : 'default'}>
                                {vc.action_plans?.[0]?.priority_level || 'Medium'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-success text-success-foreground hover:bg-success/80">Verified</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (35%) -> 1 span out of 3 */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[200px]">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="20" className="text-muted/20" />
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="314" strokeDashoffset="100" className="text-primary" />
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="314" strokeDashoffset="250" className="text-accent" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-bold">{stats.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Awaiting verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCases.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">Queue is empty</p>
                  ) : (
                    pendingCases.map(pc => (
                      <div key={pc.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer border border-transparent hover:border-border" onClick={() => router.push(\`/cases/\${pc.id}/verify\`)}>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{pc.case_number || 'New Case'}</p>
                          <p className="text-xs text-muted-foreground truncate">{new Date(pc.created_at).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
