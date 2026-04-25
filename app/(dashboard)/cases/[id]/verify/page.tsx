"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CaseTimeline } from "@/components/dashboard/CaseTimeline"
import { motion } from "framer-motion"

export default function VerificationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [extraction, setExtraction] = useState<any>(null)
  const [actionPlan, setActionPlan] = useState<any>(null)
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

        const { data: eData, error: eError } = await supabase
          .from('extractions')
          .select('*')
          .eq('case_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (eError && eError.code !== 'PGRST116') throw eError
        if (eData) setExtraction(eData)

        if (eData) {
          const { data: aData, error: aError } = await supabase
            .from('action_plans')
            .select('*')
            .eq('extraction_id', eData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (aError && aError.code !== 'PGRST116') throw aError
          if (aData) setActionPlan(aData)
        }
      } catch (err: any) {
        console.error("Error fetching verification data:", err)
        setError(err?.message ?? "Failed to load case data")
        toast.error("Failed to load case data")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const handleVerify = async (status: 'approved' | 'rejected' | 'edited_and_approved') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      await supabase.from('verifications').insert({
        case_id: id,
        extraction_id: extraction?.id,
        action_plan_id: actionPlan?.id,
        reviewer_id: user.id,
        status,
        reviewer_notes: reviewerNotes,
      })

      await supabase.from('cases').update({
        status: status === 'rejected' ? 'rejected' : 'verified'
      }).eq('id', id)

      toast.success(`Case ${status === 'rejected' ? 'rejected' : 'verified successfully'}`)
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || "Failed to verify")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative h-16 w-16">
          {[0, 1].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-primary/20"
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading case data...</p>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Case Not Found</h3>
          <p className="text-sm text-muted-foreground">{error ?? "No case data available for this ID."}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/cases')}>Back to Cases</Button>
      </div>
    )
  }

  if (!extraction || !actionPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Extraction Pending</h3>
          <p className="text-sm text-muted-foreground">
            AI extraction is still processing for <span className="font-mono text-primary">{caseData.case_number || id}</span>.<br/>
            Check back in a few moments.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/cases')}>Back to Cases</Button>
      </div>
    )
  }

  const confidenceScore = extraction.confidence_score ?? 0
  const confidenceColor = confidenceScore > 0.85 ? "text-emerald-400" : confidenceScore > 0.6 ? "text-amber-400" : "text-red-400"
  const confidenceBg    = confidenceScore > 0.85 ? "bg-emerald-500" : confidenceScore > 0.6 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      {/* LEFT PANEL: PDF Viewer */}
      <div className="w-[58%] border-r border-border bg-secondary/20 flex flex-col h-full">
        <div className="p-4 border-b border-border bg-card flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg">{extraction.case_number || "Original Judgment PDF"}</h2>
            <p className="text-xs text-muted-foreground">{caseData.pdf_filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={caseData.status ?? "processing"} size="sm" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {caseData.pdf_url && caseData.pdf_url !== 'pending' ? (
            <iframe
              src={`${caseData.pdf_url}#toolbar=0`}
              className="w-full h-full rounded-xl border border-border bg-white shadow-sm"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Save className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">PDF not available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Verification */}
      <div className="w-[42%] flex flex-col h-full bg-card">
        <div className="p-4 border-b border-border shrink-0 flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">Verification Hub</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">AI Confidence:</span>
            <span className={`font-bold ${confidenceColor}`}>{(confidenceScore * 100).toFixed(0)}%</span>
            <div className={`w-2.5 h-2.5 rounded-full ${confidenceBg}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="extraction" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="extraction">Extracted</TabsTrigger>
              <TabsTrigger value="plan">Action Plan</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>

            <TabsContent value="extraction" className="space-y-3">
              {[
                { label: "Case Number",   value: extraction.case_number   },
                { label: "Case Title",    value: extraction.case_title    },
                { label: "Petitioner",    value: extraction.petitioner    },
                { label: "Respondent",    value: extraction.respondent    },
                { label: "Court",         value: extraction.court_name    },
                { label: "Judge",         value: extraction.judge_name    },
                { label: "Date of Order", value: extraction.date_of_order },
                { label: "Outcome",       value: extraction.case_outcome  },
              ].map((field, i) => (
                <Card key={i} className="shadow-sm border-border">
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{field.label}</p>
                    <p className="text-sm font-semibold">{field.value || "Not found"}</p>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Case Timeline</h3>
                <CaseTimeline createdAt={caseData.created_at} />
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base text-primary">Action Plan Summary</CardTitle>
                    <Badge variant={actionPlan.priority_level === 'critical' ? 'destructive' : 'default'}>
                      {actionPlan.priority_level?.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  {actionPlan.summary}
                </CardContent>
              </Card>

              <h3 className="font-bold text-sm mt-4 mb-2">Compliance Actions</h3>
              {actionPlan.compliance_actions?.map((action: any, i: number) => (
                <Card key={i} className="mb-3 shadow-sm border-border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{action.priority}</Badge>
                      <span className="text-xs font-medium text-red-400">Due: {action.deadline || 'N/A'}</span>
                    </div>
                    <p className="font-medium text-sm">{action.action}</p>
                    <p className="text-xs text-muted-foreground">Responsibility: {action.responsible_authority}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="decision" className="space-y-5">
              {confidenceScore < 0.7 && (
                <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl flex items-start text-sm border border-amber-500/20 gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>AI confidence is low ({(confidenceScore * 100).toFixed(0)}%). Review extracted data carefully before approving.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Reviewer Notes (Optional)</label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Add any internal notes regarding this verification..."
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-xl"
                  onClick={() => handleVerify('approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Publish
                </Button>
                <Button
                  className="w-full rounded-xl" variant="outline"
                  onClick={() => handleVerify('edited_and_approved')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Approve with Edits
                </Button>
                <Button
                  className="w-full rounded-xl" variant="destructive"
                  onClick={() => handleVerify('rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
