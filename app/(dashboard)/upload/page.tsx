"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, File as FileIcon, AlertCircle, CheckCircle2, Loader2, BrainCircuit, FileText, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { uploadJudgmentPDF } from "@/lib/supabase/storage"
import { createBrowserClient } from "@supabase/ssr"

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [caseNumber, setCaseNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  
  // Steps: 0=upload, 1=reading, 2=extracting, 3=planning, 4=done
  const [processingStep, setProcessingStep] = useState<number>(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        let encoded = reader.result?.toString() || ''
        // remove data:application/pdf;base64, prefix
        const base64Data = encoded.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setProcessingStep(1) // Uploading & Reading
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Create cases record (processing)
      const { data: caseRecord, error: caseError } = await supabase
        .from('cases')
        .insert({
          case_number: caseNumber || `TMP-${Date.now()}`,
          uploaded_by: user.id,
          pdf_url: 'pending',
          pdf_filename: file.name,
          status: 'processing'
        })
        .select()
        .single()

      if (caseError) throw caseError

      // 2. Upload to Supabase Storage
      const { publicUrl } = await uploadJudgmentPDF(file, caseRecord.id)
      
      await supabase
        .from('cases')
        .update({ pdf_url: publicUrl })
        .eq('id', caseRecord.id)

      setProcessingStep(2) // Extracting
      
      // 3. Convert PDF to base64 for Gemini
      const base64Pdf = await convertFileToBase64(file)

      // 4. Trigger Extraction API
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseRecord.id, pdfBase64: base64Pdf })
      })
      const extractData = await extractRes.json()
      
      if (!extractRes.ok) throw new Error(extractData.error || "Extraction failed")

      setProcessingStep(3) // Action Planning
      
      // 5. Trigger Action Plan API
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractionId: extractData.extraction.id })
      })
      const planData = await planRes.json()

      if (!planRes.ok) throw new Error(planData.error || "Action plan failed")

      setProcessingStep(4) // Done
      toast.success("Judgment successfully processed and extracted.")
      
      // Redirect to verification
      setTimeout(() => {
        router.push(`/cases/${caseRecord.id}/verify`)
      }, 1500)

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "An error occurred during upload")
      setIsUploading(false)
      setProcessingStep(0)
    }
  }

  const steps = [
    { id: 1, name: "Uploading PDF", icon: UploadCloud },
    { id: 2, name: "AI extracting information", icon: BrainCircuit },
    { id: 3, name: "Generating action plan", icon: FileText },
    { id: 4, name: "Ready for verification", icon: CheckSquare },
  ]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Upload Judgment</h1>
        <p className="text-muted-foreground mt-1">Upload a court PDF to automatically extract compliance actions.</p>
      </motion.div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            {processingStep === 4 ? "Extraction Complete" : "Drag & Drop PDF"}
          </CardTitle>
          <CardDescription>
            {processingStep > 0 
              ? "The AI is processing the judgment..." 
              : "Upload official court orders or judgments (Max 50MB)"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <AnimatePresence mode="wait">
            {processingStep === 0 ? (
              <motion.div 
                key="upload-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div 
                  {...getRootProps()} 
                  className={\`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors \${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }\`}
                >
                  <input {...getInputProps()} />
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop the PDF here" : "Drag & drop your PDF here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                  
                  {file && (
                    <div className="mt-6 flex items-center justify-center p-3 border rounded-md bg-background/50 w-full max-w-md mx-auto">
                      <FileIcon className="h-5 w-5 text-primary mr-3 shrink-0" />
                      <span className="flex-1 text-sm truncate font-medium text-left">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber">Case Number (Optional)</Label>
                    <Input 
                      id="caseNumber" 
                      placeholder="e.g. WP(C) 1234/2023" 
                      value={caseNumber}
                      onChange={e => setCaseNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Assign to Department (Optional)</Label>
                    <select 
                      id="department"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                    >
                      <option value="">Auto-detect</option>
                      <option value="revenue">Revenue Department</option>
                      <option value="pwd">PWD</option>
                      <option value="health">Health Department</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto space-y-6 py-8"
              >
                <div className="space-y-6">
                  {steps.map((step) => {
                    const isActive = processingStep === step.id
                    const isDone = processingStep > step.id
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="flex items-center space-x-4">
                        <div className={\`flex items-center justify-center h-10 w-10 rounded-full border-2 \${
                          isDone ? 'bg-success border-success text-success-foreground' : 
                          isActive ? 'border-primary text-primary bg-primary/10' : 
                          'border-muted text-muted-foreground'
                        }\`}>
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : 
                           isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : 
                           <Icon className="h-5 w-5" />}
                        </div>
                        <div className={\`font-medium \${isActive ? 'text-foreground font-bold' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/50'}\`}>
                          {step.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {processingStep === 0 && (
          <CardFooter className="justify-center border-t p-6 bg-muted/20 rounded-b-xl">
            <Button 
              size="lg" 
              className="w-full max-w-md shadow-md text-lg h-12" 
              disabled={!file || isUploading}
              onClick={handleUpload}
            >
              Start AI Analysis
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3"
      >
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-primary-light">
          <p className="font-semibold mb-1">Secure Government Environment</p>
          <p>All uploaded documents are processed securely and are not used to train public AI models. Data is encrypted at rest and in transit.</p>
        </div>
      </motion.div>
    </div>
  )
}
