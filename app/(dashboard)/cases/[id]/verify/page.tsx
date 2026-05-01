"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, CheckCircle, XCircle, AlertTriangle, Building2, Calendar, Gavel, Scale } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CaseTimeline } from "@/components/dashboard/CaseTimeline"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function VerificationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [actions, setActions] = useState<any[]>([])
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cData, error: cError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', id)
          .single()

        if (cError) throw cError
        setCaseData(cData)

        const { data: aData, error: aError } = await supabase
          .from('compliance_actions')
          .select('*')
          .eq('case_id', id)
          .order('deadline', { ascending: true })

        if (aError) throw aError
        setActions(aData || [])

      } catch (err: any) {
        console.error("Error fetching verification data:", err)
        setError(err?.message ?? "Failed to load case data")
        toast.error("Failed to load case data")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, supabase])

  const handleVerify = async (status: 'verified' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('cases')
        .update({
          status,
          // We could also store reviewer notes in a new column if we had it
        })
        .eq('id', id)

      if (error) throw error

      toast.success(`Case ${status === 'rejected' ? 'rejected' : 'verified and activated'}`)
      router.push(`/cases/${id}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to verify")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading case for verification...</p>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <h3 className="text-lg font-bold">Verification Error</h3>
        <p className="text-muted-foreground">{error || "Case not found"}</p>
        <Button onClick={() => router.push('/cases')}>Back to Cases</Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 overflow-hidden">
      {/* LEFT: PDF */}
      <div className="w-1/2 border-r border-border bg-secondary/10 flex flex-col">
        <div className="p-4 border-b border-border bg-card flex justify-between items-center">
          <h2 className="font-bold text-sm">ORIGINAL JUDGMENT</h2>
          <Badge variant="outline" className="font-mono text-[10px]">{caseData.case_number}</Badge>
        </div>
        <div className="flex-1 p-4">
          <iframe src={`${caseData.pdf_url}#toolbar=0`} className="w-full h-full rounded-xl border border-border bg-white" />
        </div>
      </div>

      {/* RIGHT: Verification */}
      <div className="w-1/2 flex flex-col bg-card">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">Review & Verification</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Risk:</span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              (caseData.risk_score || 0) >= 7 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
              {caseData.risk_score || 0}/10
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="extraction" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="extraction">Extracted Data</TabsTrigger>
              <TabsTrigger value="actions">Compliance Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="extraction" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-secondary/20">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Court</p>
                    <p className="text-sm font-semibold">{caseData.court}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/20">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Judgment Date</p>
                    <p className="text-sm font-semibold">{caseData.judgment_date || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary/20">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Case Title</p>
                  <p className="text-sm font-semibold">{caseData.title}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary/20">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Summary</p>
                  <p className="text-sm leading-relaxed">{caseData.summary}</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4">Case Timeline</h3>
                <CaseTimeline createdAt={caseData.created_at} />
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              {actions.map((action, i) => (
                <Card key={action.id} className="border-border shadow-sm overflow-hidden">
                  <div className={cn(
                    "h-1.5 w-full",
                    action.priority === 'HIGH' ? 'bg-red-500' : action.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                  )} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="text-[10px]">{action.category}</Badge>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {action.deadline || 'NO DEADLINE'}
                      </div>
                    </div>
                    <p className="text-sm font-medium">{action.action}</p>
                    <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground font-bold">
                      <Building2 className="h-3 w-3" />
                      {action.responsible_department}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* DECISION AREA */}
        <div className="p-6 border-t border-border bg-secondary/10 space-y-4 shrink-0">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Internal Reviewer Notes</label>
            <textarea
              className="w-full h-20 p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Add verification notes here..."
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => handleVerify('rejected')}>
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button className="flex-[2] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" onClick={() => handleVerify('verified')}>
              <CheckCircle className="mr-2 h-4 w-4" /> Verify & Activate Actions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
