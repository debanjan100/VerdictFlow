"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud, FileText, CheckCircle2, Loader2, BrainCircuit,
  CheckSquare, ArrowRight, RotateCcw, Eye,
  Edit2, Sparkles, ShieldCheck, AlertTriangle, Building2, Calendar, Gavel, FileSignature, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/* ─── Types ─── */
interface ComplianceAction {
  id?: string
  action: string
  responsibleDepartment: string
  deadline: string | null
  priority: string
  category: string
  included?: boolean // UI state
}

interface ExtractedData {
  caseTitle: string
  caseNumber: string | null
  courtName: string
  judgmentDate: string | null
  bench: string | null
  summary: string
  keyDirectives: string[]
  complianceActions: ComplianceAction[]
  penalties: string | null
  nextHearingDate: string | null
  tags: string[]
}

const STEPS = ["Upload", "AI Processing", "Review Extraction", "Confirm & Submit"]

/* ─── Step indicator ─── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
                done && "border-emerald-500 bg-emerald-500 text-white",
                active && "border-blue-500 bg-blue-500/15 text-blue-400",
                !done && !active && "border-border text-muted-foreground",
              )}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium whitespace-nowrap hidden sm:block",
                active ? "text-blue-400" : done ? "text-emerald-400" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-12 sm:w-20 mx-1 mb-5 transition-colors duration-500", i < current ? "bg-emerald-500" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── STEP 1: Upload ─── */
function Step1Upload({
  onNext, file, setFile, isAnalyzing
}: {
  onNext: () => void
  file: File | null
  setFile: (f: File | null) => void
  isAnalyzing: boolean
}) {
  const [shake, setShake] = useState(false)

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      if (rejected[0].errors[0].code === "file-too-large") {
        toast.error("File exceeds 50MB limit")
      } else {
        toast.error("Only PDF files are accepted.")
      }
      return
    }
    if (accepted[0]) setFile(accepted[0])
  }, [setFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    disabled: isAnalyzing
  })

  const { onDrag: _onDrag, onDragStart: _onDragStart, onDragEnd: _onDragEnd, ...rootProps } = getRootProps()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div {...rootProps}>
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group",
            isDragActive
              ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
              : file
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-blue-500/50 hover:bg-blue-500/5",
            isAnalyzing && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />

          {/* Animated dashed border overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <rect
                x="1" y="1" width="calc(100% - 2)" height="calc(100% - 2)"
                rx="15" fill="none" stroke={isDragActive ? "#3b82f6" : "transparent"}
                strokeWidth="2" strokeDasharray="8 4"
                style={{ animation: isDragActive ? "dash-rotate 1s linear infinite" : "none" }}
              />
            </svg>
          </div>

          <div className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300",
            file ? "bg-emerald-500/15" : "bg-blue-500/10 group-hover:bg-blue-500/15"
          )}>
            {file
              ? <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              : <UploadCloud className={cn("h-8 w-8 transition-transform duration-300", isDragActive ? "scale-125 text-blue-400" : "text-blue-400/70 group-hover:scale-110")} />}
          </div>

          {file ? (
            <div>
              <p className="text-lg font-semibold text-emerald-400 mb-1">File ready</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
                <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-muted-foreground text-xs shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Click or drag to replace</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-1">
                {isDragActive ? "Drop it here!" : "Drag & drop your PDF"}
              </p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <p className="text-xs text-muted-foreground/60 mt-2">PDF only · Max 50 MB</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="caseNum" className="text-xs">Case Number (Optional)</Label>
          <Input id="caseNum" placeholder="e.g. WP(C) 1234/2024" className="rounded-xl bg-secondary/50" disabled={isAnalyzing} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dept" className="text-xs">Department (Optional)</Label>
          <select id="dept" className="flex h-9 w-full rounded-xl border border-input bg-secondary/50 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" disabled={isAnalyzing}>
            <option value="">Auto-detect</option>
            <option value="revenue">Revenue</option>
            <option value="pwd">PWD</option>
            <option value="health">Health</option>
            <option value="environment">Environment</option>
          </select>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full h-12 rounded-xl text-base shadow-lg shadow-blue-500/20 gap-2"
        disabled={!file || isAnalyzing}
        onClick={onNext}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            Start AI Analysis <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>All uploads are encrypted at rest and in transit. Documents are not used to train public AI models.</p>
      </div>
    </motion.div>
  )
}

/* ─── STEP 2: AI Processing ─── */
function Step2Processing({ file, onComplete, onError }: { file: File; onComplete: (data: ExtractedData) => void; onError: (msg: string) => void }) {
  const [statusMsg, setStatusMsg] = useState("Initializing connection...")
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<string>("init")

  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const analyzeDoc = async () => {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/analyze-judgment/stream", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || "Failed to start analysis")
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No readable stream available")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim()
              try {
                const data = JSON.parse(dataStr)

                if (data.stage === "error") {
                  throw new Error(data.message)
                }

                setStage(data.stage)
                setStatusMsg(data.message)
                setProgress(data.progress)

                if (data.stage === "complete" && data.data) {
                  // Add 'included: true' to all actions by default
                  const parsedData = {
                    ...data.data,
                    complianceActions: data.data.complianceActions.map((a: any) => ({ ...a, included: true }))
                  }
                  setTimeout(() => onComplete(parsedData), 1000)
                }
              } catch (e) {
                // partial parse or format issue, ignore
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Analysis Error:", err)
        onError(err.message || "An unexpected error occurred.")
      }
    }

    analyzeDoc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = [
    { id: "parsing", label: "Parsing PDF document", icon: FileText },
    { id: "extracting", label: "Extracting case information", icon: Eye },
    { id: "analyzing", label: "Analyzing judgment with Gemini", icon: BrainCircuit },
    { id: "generating", label: "Generating structured action plan", icon: FileSignature },
  ]

  const getCurrentStepIndex = () => {
    const idx = steps.findIndex(s => s.id === stage)
    if (stage === "complete" || stage === "finalizing") return steps.length
    return idx === -1 ? 0 : idx
  }

  const currentIdx = getCurrentStepIndex()

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-8 space-y-8">
      {/* Brain animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-24 w-24">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-blue-500/20"
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-1">AI is analyzing your document</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMsg}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-blue-400"
            >
              {statusMsg}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-xs mx-auto">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="max-w-sm mx-auto space-y-3">
        {steps.map((s, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          const Icon = s.icon
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: done || active ? 1 : 0.4 }}
              className="flex items-center gap-3"
            >
              <div className={cn(
                "h-9 w-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all",
                done && "border-emerald-500 bg-emerald-500/15",
                active && "border-blue-500 bg-blue-500/15",
                !done && !active && "border-border",
              )}>
                {done
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  : active
                    ? <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    : <Icon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <span className={cn(
                "text-sm font-medium",
                done ? "text-emerald-400" : active ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── STEP 3: Review Extraction ─── */
function Step3Review({ data, setData, file, onNext }: { data: ExtractedData; setData: (d: ExtractedData) => void; file: File; onNext: () => void }) {
  const [saving, setSaving] = useState(false)

  const toggleAction = (id: string) =>
    setData({
      ...data,
      complianceActions: data.complianceActions.map(a => a.id === id ? { ...a, included: !a.included } : a)
    })

  const selectedCount = data.complianceActions.filter(a => a.included).length

  const handleSubmit = async () => {
    if (saving) return
    setSaving(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to upload cases")
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `judgments/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('judgments')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('judgments')
        .getPublicUrl(filePath)

      const response = await fetch('/api/save-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisData: data,
          caseNumber: data.caseNumber,
          department: data.complianceActions?.[0]?.responsibleDepartment || "Unassigned",
          pdfUrl: publicUrl,
          pdfFilename: file.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save case');
      }

      toast.success("Case submitted successfully!")
      onNext()

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to save case. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="text-emerald-400 font-medium">AI extraction complete.</span>
        <span className="text-muted-foreground">Review and edit the results below.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Metadata */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Case Details</h3>
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><Edit2 className="h-3 w-3" />Editable</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Case Title", value: data.caseTitle, key: "caseTitle" },
                { label: "Case Number", value: data.caseNumber, key: "caseNumber" },
                { label: "Court", value: data.courtName, key: "courtName" },
                { label: "Judgment Date", value: data.judgmentDate, key: "judgmentDate" },
              ].map(({ label, value, key }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    value={value || ""}
                    onChange={e => setData({ ...data, [key]: e.target.value })}
                    className="h-8 rounded-lg bg-background/50 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bench</Label>
              <Input
                value={data.bench || ""}
                onChange={e => setData({ ...data, bench: e.target.value })}
                className="h-8 rounded-lg bg-background/50 text-sm"
              />
            </div>
          </div>

          {/* Compliance Actions */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Compliance Actions ({selectedCount}/{data.complianceActions.length})</h3>
              </div>
              <span className="text-xs text-muted-foreground">Toggle to include</span>
            </div>

            <div className="space-y-3">
              {data.complianceActions.map((a, idx) => (
                <div
                  key={a.id || idx}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-xl border transition-all",
                    a.included ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-background/30 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => toggleAction(a.id || `action-${idx}`)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer",
                        a.included ? "border-blue-500 bg-blue-500" : "border-border hover:border-blue-500/50"
                      )}
                    >
                      {a.included && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Direction {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={a.priority.toLowerCase()} size="sm" />
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border uppercase tracking-wide">
                            {a.category}
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={a.action}
                        onChange={(e) => {
                          const newActions = data.complianceActions.map((act, i) => (act.id === a.id || i === idx) ? { ...act, action: e.target.value } : act)
                          setData({ ...data, complianceActions: newActions })
                        }}
                        className="w-full bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 -ml-1 border border-transparent hover:border-border"
                        rows={3}
                      />
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <input
                            value={a.responsibleDepartment}
                            onChange={(e) => {
                              const newActions = data.complianceActions.map((act, i) => (act.id === a.id || i === idx) ? { ...act, responsibleDepartment: e.target.value } : act)
                              setData({ ...data, complianceActions: newActions })
                            }}
                            className="bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-24"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <input
                            value={a.deadline || ""}
                            onChange={(e) => {
                              const newActions = data.complianceActions.map((act, i) => (act.id === a.id || i === idx) ? { ...act, deadline: e.target.value } : act)
                              setData({ ...data, complianceActions: newActions })
                            }}
                            className="bg-transparent border-b border-transparent focus:border-amber-500 focus:outline-none w-32"
                            placeholder="YYYY-MM-DD"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b border-border pb-2">Analysis Overview</h3>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Judgment Date</p>
              <p className="text-sm font-bold">{data.judgmentDate || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Hearing</p>
              <p className="text-sm font-semibold text-amber-400">{data.nextHearingDate || "None"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">AI Summary</p>
              <p className="text-xs leading-relaxed text-foreground/80">{data.summary}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Penalties</p>
              <p className="text-sm font-semibold text-red-400">{data.penalties || "None"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b border-border pb-2">Parties & Tags</h3>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bench</p>
              <p className="text-xs bg-secondary px-2 py-1 rounded-md">{data.bench || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {data.tags?.map((t, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wide bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button size="lg" className="w-full h-12 rounded-xl gap-2 shadow-lg shadow-blue-500/20" onClick={handleSubmit} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving Case...
          </>
        ) : (
          <>
            Confirm & Submit {selectedCount} Actions <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </motion.div>
  )
}

/* ─── STEP 4: Success ─── */
function Step4Success({ onReset }: { onReset: () => void }) {
  const router = useRouter()
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-6">
      {/* Confetti dots */}
      <div className="relative flex justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 1, scale: 0 }}
            animate={{
              y: [-20, -60 - i * 10],
              x: [(i - 4) * 20, (i - 4) * 40],
              opacity: [1, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{ duration: 1.2, delay: i * 0.1 }}
            className={cn(
              "absolute h-3 w-3 rounded-full",
              ["bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-purple-400", "bg-cyan-400", "bg-pink-400", "bg-yellow-400"][i]
            )}
          />
        ))}
        <div className="h-24 w-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.3 }}
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold mb-2">Case Added to Queue!</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          The judgment has been processed and compliance actions extracted. It's now pending officer review.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="rounded-xl gap-2" onClick={() => router.push("/cases")}>
          <FileText className="h-4 w-4" />
          View in Cases Directory
        </Button>
        <Button size="lg" variant="outline" className="rounded-xl gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Upload Another
        </Button>
      </div>
    </motion.div>
  )
}

/* ─── Bulk Upload Queue ─── */
function BulkUploadQueue() {
  const [uploadQueue, setUploadQueue] = useState<{
    id: string;
    file: File;
    status: 'waiting' | 'processing' | 'done' | 'error';
    result?: any;
    error?: string;
  }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(f => ({
      id: Math.random().toString(36).substring(2),
      file: f,
      status: 'waiting' as const
    }))
    setUploadQueue(q => [...q, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  })

  const processQueue = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    const supabase = createClient()

    for (let i = 0; i < uploadQueue.length; i++) {
      let currentItem;
      setUploadQueue(q => {
        currentItem = q[i];
        if (!currentItem || currentItem.status !== 'waiting') return q;
        const newQ = [...q];
        newQ[i] = { ...newQ[i], status: 'processing' };
        return newQ;
      });

      // Need to grab current state again directly from state array since closure is tricky
      // It's safer to just await inside the loop and trust the synchronous state read
      if (!uploadQueue[i] || uploadQueue[i].status !== 'waiting') continue;

      try {
        const formData = new FormData()
        formData.append("file", uploadQueue[i].file)

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to start analysis")
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error("No analysis data returned")
        }

        const extractedData = result.data;
        // Add IDs to actions for bulk too
        extractedData.complianceActions = extractedData.complianceActions.map((a: any, idx: number) => ({
          ...a,
          id: `bulk-action-${idx}`,
          included: true
        }))

        const fileExt = uploadQueue[i].file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `judgments/${fileName}`

        const { error: uploadError } = await supabase.storage.from('judgments').upload(filePath, uploadQueue[i].file)
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage.from('judgments').getPublicUrl(filePath)

        const saveRes = await fetch('/api/save-case', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysisData: extractedData,
            caseNumber: extractedData.caseNumber,
            department: extractedData.complianceActions?.[0]?.responsibleDepartment,
            pdfUrl: publicUrl,
            pdfFilename: uploadQueue[i].file.name
          })
        });

        if (!saveRes.ok) {
          const err = await saveRes.json();
          throw new Error(err.error || 'Failed to save case');
        }

        setUploadQueue(q => {
          const newQ = [...q];
          newQ[i] = { ...newQ[i], status: 'done', result: extractedData };
          return newQ;
        });

      } catch (error: any) {
        setUploadQueue(q => {
          const newQ = [...q];
          newQ[i] = { ...newQ[i], status: 'error', error: error.message };
          return newQ;
        });
      }
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={cn("border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all", isDragActive ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-500/50 hover:bg-blue-500/5")}>
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 mx-auto text-blue-400 mb-4" />
        <p className="text-lg font-semibold mb-1">Drag & drop multiple PDFs</p>
        <p className="text-sm text-muted-foreground">or click to browse files</p>
      </div>

      {uploadQueue.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Upload Queue</h3>
            <Button onClick={processQueue} disabled={isProcessing || uploadQueue.every(q => q.status === 'done' || q.status === 'error')}>
              {isProcessing ? "Processing..." : "Process Queue"}
            </Button>
          </div>
          <div className="space-y-3">
            {uploadQueue.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{item.file.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {item.status === 'waiting' && <span className="text-muted-foreground">Waiting</span>}
                  {item.status === 'processing' && <span className="text-blue-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Processing</span>}
                  {item.status === 'done' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Done</span>}
                  {item.status === 'error' && <span className="text-red-400 flex items-center gap-1" title={item.error}><AlertTriangle className="h-4 w-4"/> Error</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function UploadPage() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleStartAnalysis = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsAnalyzing(true);
    setStep(1);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // DO NOT set Content-Type header manually — browser sets it with boundary 

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? `Server error ${response.status}`);
      }

      if (!result.success || !result.data) {
        throw new Error('No analysis data returned');
      }

      // Add 'included: true' to all actions by default
      const processedData = {
        ...result.data,
        complianceActions: result.data.complianceActions.map((a: any, i: number) => ({ 
          ...a, 
          id: `action-${i}`,
          included: true 
        }))
      }

      setExtracted(processedData);
      setStep(2); // Move to Review Extraction 
      toast.success('Analysis complete!');
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast.error(err.message ?? 'Analysis failed');
      setStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setStep(0); setFile(null); setExtracted(null); setIsAnalyzing(false) }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Upload Judgment</h1>
        <p className="text-muted-foreground mt-1">AI-powered 4-step judgment intake wizard.</p>
      </motion.div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-sm mx-auto">
          <TabsTrigger value="single">Single Upload Wizard</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <StepIndicator current={step} />

            <AnimatePresence mode="wait">
              {step === 0 && (
                <Step1Upload 
                  key="s1" 
                  file={file} 
                  setFile={setFile} 
                  onNext={handleStartAnalysis} 
                  isAnalyzing={isAnalyzing}
                />
              )}
              {step === 1 && (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                  <p className="text-lg font-medium">AI is analyzing your judgment...</p>
                  <p className="text-sm text-muted-foreground">This may take up to a minute.</p>
                </div>
              )}
              {step === 2 && extracted && file && (
                <Step3Review
                  key="s3"
                  data={extracted}
                  setData={setExtracted}
                  file={file}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <Step4Success key="s4" onReset={reset} />
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <BulkUploadQueue />
        </TabsContent>
      </Tabs>
    </div>
  )
}
