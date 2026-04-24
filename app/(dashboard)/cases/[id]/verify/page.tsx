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

export default function VerificationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [extraction, setExtraction] = useState<any>(null)
  const [actionPlan, setActionPlan] = useState<any>(null)
  const [reviewerNotes, setReviewerNotes] = useState("")

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
      } catch (error) {
        console.error("Error fetching verification data:", error)
        toast.error("Failed to load case data")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, supabase])

  const handleVerify = async (status: 'approved' | 'rejected' | 'edited_and_approved') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      await supabase.from('verifications').insert({
        case_id: id,
        extraction_id: extraction.id,
        action_plan_id: actionPlan.id,
        reviewer_id: user.id,
        status,
        reviewer_notes: reviewerNotes,
      })

      await supabase.from('cases').update({
        status: status === 'rejected' ? 'rejected' : 'verified'
      }).eq('id', id)

      toast.success(\`Case \${status === 'rejected' ? 'rejected' : 'verified successfully'}\`)
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || "Failed to verify")
    }
  }

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!caseData || !extraction || !actionPlan) return <div>Missing data for verification.</div>

  const confidenceColor = extraction.confidence_score > 0.85 ? "bg-success" : extraction.confidence_score > 0.6 ? "bg-warning" : "bg-destructive"

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      {/* LEFT PANEL: PDF Viewer */}
      <div className="w-[60%] border-r bg-muted/30 flex flex-col h-full">
        <div className="p-4 border-b bg-surface flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg">{extraction.case_number || "Original Judgment PDF"}</h2>
            <p className="text-xs text-muted-foreground">{caseData.pdf_filename}</p>
          </div>
          <Badge variant="outline">PDF View</Badge>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {caseData.pdf_url && caseData.pdf_url !== 'pending' ? (
            <iframe 
              src={\`\${caseData.pdf_url}#toolbar=0\`} 
              className="w-full h-full rounded border bg-white shadow-sm"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">PDF not available</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Verification Form */}
      <div className="w-[40%] flex flex-col h-full bg-surface">
        <div className="p-4 border-b shrink-0 flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">Verification Hub</h2>
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span>AI Confidence: {(extraction.confidence_score * 100).toFixed(0)}%</span>
            <div className={\`w-3 h-3 rounded-full \${confidenceColor}\`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="extraction" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="extraction">Extracted Data</TabsTrigger>
              <TabsTrigger value="plan">Action Plan</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>
            
            <TabsContent value="extraction" className="space-y-4">
              <div className="space-y-4">
                {[
                  { label: "Case Number", value: extraction.case_number },
                  { label: "Case Title", value: extraction.case_title },
                  { label: "Petitioner", value: extraction.petitioner },
                  { label: "Respondent", value: extraction.respondent },
                  { label: "Court", value: extraction.court_name },
                  { label: "Judge", value: extraction.judge_name },
                  { label: "Date of Order", value: extraction.date_of_order },
                  { label: "Outcome", value: extraction.case_outcome },
                ].map((field, i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{field.label}</p>
                      <p className="text-sm font-semibold">{field.value || "Not found"}</p>
                    </CardContent>
                  </Card>
                ))}
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

              <h3 className="font-bold text-sm mt-6 mb-2">Compliance Actions</h3>
              {actionPlan.compliance_actions?.map((action: any, i: number) => (
                <Card key={i} className="mb-3 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{action.priority}</Badge>
                      <span className="text-xs font-medium text-destructive">Due: {action.deadline || 'N/A'}</span>
                    </div>
                    <p className="font-medium text-sm">{action.action}</p>
                    <p className="text-xs text-muted-foreground">Responsibility: {action.responsible_authority}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="decision" className="space-y-6">
              {extraction.confidence_score < 0.7 && (
                <div className="bg-warning/10 text-warning-foreground p-3 rounded-md flex items-start text-sm border border-warning/20">
                  <AlertTriangle className="h-5 w-5 mr-2 shrink-0 text-warning" />
                  <p>AI confidence is low ({(extraction.confidence_score * 100).toFixed(0)}%). Please review the extracted data and action plan carefully.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reviewer Notes (Optional)</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Add any internal notes regarding this verification..."
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleVerify('approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Publish
                </Button>
                <Button 
                  className="w-full" variant="outline"
                  onClick={() => handleVerify('edited_and_approved')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Approve with Edits
                </Button>
                <Button 
                  className="w-full" variant="destructive"
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
