"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, FileText, Calendar, Building2, AlertTriangle, CheckCircle2, Loader2, Clock, Gavel, FileSignature, BrainCircuit, ShieldCheck, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CaseTimeline } from "@/components/dashboard/CaseTimeline"

export default function CaseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState<any>(null)
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const { data: caseRow, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', id)
          .single()

        if (caseError) throw caseError

        const { data: actionsRows, error: actionsError } = await supabase
          .from('compliance_actions')
          .select('*')
          .eq('case_id', id)
          .order('deadline', { ascending: true })

        if (actionsError) throw actionsError

        setCaseData(caseRow)
        setActions(actionsRows || [])
      } catch (err: any) {
        console.error("Error fetching case details:", err)
        toast.error("Failed to load case details")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCaseDetails()
  }, [id, supabase])

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('compliance_actions')
        .update({ status: newStatus })
        .eq('id', actionId)

      if (error) throw error

      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a))
      toast.success("Status updated")
    } catch (err: any) {
      toast.error("Failed to update status")
    }
  }

  const generateActionPlan = async () => {
    if (generatingPlan) return
    setGeneratingPlan(true)
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: id,
          caseTitle: caseData.title,
          summary: caseData.summary,
          actions: actions.map(a => a.action)
        })
      })
      if (!res.ok) throw new Error("Failed to generate plan")
      const data = await res.json()
      toast.success("Action plan generated successfully!")
      console.log("Generated Plan:", data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGeneratingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground">Loading case details...</p>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Case not found</h2>
        <Button onClick={() => router.push("/cases")}>Return to Cases</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-10 w-10 border border-border bg-secondary/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                {caseData.case_number || "Draft"}
              </span>
              <StatusBadge status={caseData.status} size="sm" />
              <StatusBadge status={caseData.priority} size="sm" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{caseData.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {caseData.status === 'pending_review' && (
            <Button onClick={() => router.push(`/cases/${id}/verify`)} variant="outline" className="rounded-xl gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              <ShieldCheck className="h-4 w-4" /> Verify Case
            </Button>
          )}
          <Button onClick={generateActionPlan} disabled={generatingPlan} className="rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
            {generatingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Generate Plan
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Risk Assessment</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-2xl font-black",
                    (caseData.risk_score || 0) >= 7 ? "text-red-400" : (caseData.risk_score || 0) >= 4 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {caseData.risk_score || "0"}/10
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {(caseData.risk_score || 0) >= 7 ? "Critical Risk" : (caseData.risk_score || 0) >= 4 ? "Moderate Risk" : "Low Risk"}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Compliance</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-400">{caseData.estimated_compliance_days || "30"}</span>
                  <span className="text-xs text-muted-foreground font-medium">Days to complete</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border bg-secondary/20">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" /> Case Details
              </h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5"/> Court</p>
                  <p className="font-medium text-sm">{caseData.court || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Gavel className="h-3.5 w-3.5"/> Bench</p>
                  <p className="font-medium text-sm">{caseData.bench || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> Judgment Date</p>
                  <p className="font-medium text-sm">{caseData.judgment_date ? new Date(caseData.judgment_date).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Department</p>
                  <p className="font-medium text-sm">{caseData.department || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tags / Sections</p>
                  <div className="flex flex-wrap gap-1">
                    {caseData.tags?.map((t: string) => (
                      <span key={t} className="text-[10px] uppercase bg-secondary px-2 py-0.5 rounded border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Summary</p>
                <p className="text-sm leading-relaxed text-foreground/80">{caseData.summary}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-emerald-400" /> Compliance Actions
              </h2>
              <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full">
                {actions.length} Action{actions.length !== 1 && 's'}
              </span>
            </div>
            <div className="p-0">
              {actions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No compliance actions found.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {actions.map((action) => (
                    <li key={action.id} className="p-5 hover:bg-secondary/10 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <p className="text-sm font-medium leading-snug">{action.action}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md border border-border">
                              <Building2 className="h-3 w-3"/> {action.responsible_department || 'Unassigned'}
                            </span>
                            <span className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-md border",
                              action.deadline ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-secondary/50 border-border"
                            )}>
                              <Clock className="h-3 w-3"/> 
                              {action.deadline ? `Due ${new Date(action.deadline).toLocaleDateString()}` : 'No deadline'}
                            </span>
                            <StatusBadge status={action.priority} size="sm" />
                          </div>
                        </div>
                        <div className="shrink-0 space-y-2 text-right">
                           <select 
                            value={action.status} 
                            onChange={(e) => updateActionStatus(action.id, e.target.value)}
                            className={cn(
                              "text-xs font-semibold rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer",
                              action.status === 'done' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                              action.status === 'in_progress' ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                              action.status === 'overdue' ? "bg-red-500/15 text-red-400 border-red-500/30" :
                              "bg-secondary text-foreground border-border"
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Completed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column: PDF Preview & Timeline */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/20">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Case Timeline</h3>
            </div>
            <div className="p-6">
              <CaseTimeline createdAt={caseData.created_at} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card overflow-hidden h-[400px] flex flex-col lg:sticky lg:top-24">
            <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Judgment Document</h3>
              {caseData.pdf_url && (
                <a href={caseData.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                  Open Full
                </a>
              )}
            </div>
            <div className="flex-1 bg-muted/30 relative">
              {caseData.pdf_url ? (
                <iframe src={`${caseData.pdf_url}#toolbar=0`} className="absolute inset-0 w-full h-full" title="PDF Preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  No PDF document available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
