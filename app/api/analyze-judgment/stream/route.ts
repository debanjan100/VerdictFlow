import { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import pdfParse from "pdf-parse"

export const dynamic = 'force-dynamic' // Ensure streaming works

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const SYSTEM_PROMPT = `
You are a legal AI assistant specialized in analyzing Indian court judgments. 
Analyze the provided court judgment text and extract the following information 
in strict JSON format. Do not include any text outside the JSON object.

Return this exact JSON structure:
{
  "caseNumber": "string — e.g. WP(C) No. 1234/2024",
  "court": "string — e.g. Supreme Court of India",
  "department": "string — e.g. Ministry of Environment, Forest & Climate Change",
  "dateOfJudgment": "string — DD Month YYYY format",
  "dateOfFiling": "string — DD Month YYYY format or null",
  "judges": ["array of judge names as strings"],
  "petitioners": ["array of petitioner names"],
  "respondents": ["array of respondent names"],
  "caseType": "string — PIL / Civil Appeal / Criminal Appeal / Writ Petition / etc.",
  "subject": "string — one-line subject matter of the case",
  "summary": "string — 3-4 sentence plain-English summary of the judgment",
  "verdict": "string — Allowed / Dismissed / Disposed / Remanded / Partly Allowed",
  "priority": "CRITICAL | HIGH | MEDIUM | LOW — based on urgency of compliance deadlines",
  "complianceActions": [
    {
      "id": "string — unique id like DIR-001",
      "directionNumber": "string — e.g. Direction 1",
      "department": "string — which government department must act",
      "action": "string — what exactly must be done (full description)",
      "deadline": "string — exact deadline date or duration like Within 30 days",
      "deadlineDate": "string — calculated ISO date if possible, else null",
      "priority": "CRITICAL | HIGH | MEDIUM | LOW",
      "category": "Financial | Structural | Reporting | Enforcement | Monitoring | Other"
    }
  ],
  "penalties": "string — any fines or costs imposed, or null",
  "nextHearingDate": "string — if mentioned, else null",
  "keyLegalSections": ["array of laws/sections cited e.g. Article 21, Section 15 EPA"],
  "estimatedComplianceDays": 0,
  "riskScore": 0
}
`

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        if (!GEMINI_API_KEY) {
          throw new Error("Gemini API key not configured")
        }

        sendEvent({ stage: "parsing", message: "Parsing PDF document...", progress: 10 })

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
          throw new Error("No file provided")
        }

        if (file.size > 50 * 1024 * 1024) {
          throw new Error("File exceeds 50MB limit")
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        let pdfText = ""
        try {
          const pdfData = await pdfParse(buffer)
          pdfText = pdfData.text
          
          if (!pdfText || pdfText.trim().length < 50) {
            throw new Error("This PDF appears to be a scanned image. Please upload a text-based PDF or use OCR first.")
          }
        } catch (parseError) {
          throw new Error("Could not parse this file. Please ensure it is a valid PDF document.")
        }

        sendEvent({ stage: "extracting", message: "Extracting case information...", progress: 30 })

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `${SYSTEM_PROMPT}\n\nHere is the judgment text to analyze:\n\n${pdfText}`

        sendEvent({ stage: "analyzing", message: "Analyzing judgment text with Gemini...", progress: 50 })

        const resultStream = await model.generateContentStream(prompt)
        
        let fullText = ""
        let isGenerating = false
        
        for await (const chunk of resultStream) {
          if (!isGenerating) {
            sendEvent({ stage: "generating", message: "Generating structured action plan...", progress: 75 })
            isGenerating = true
          }
          fullText += chunk.text()
        }

        sendEvent({ stage: "finalizing", message: "Finalizing data...", progress: 95 })

        let jsonStr = fullText.trim()
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim()
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim()
        }

        const parsedJson = JSON.parse(jsonStr)

        sendEvent({ 
          stage: "complete", 
          message: "Analysis complete!", 
          progress: 100, 
          data: parsedJson 
        })

        controller.close()

      } catch (error: any) {
        console.error("Stream Error:", error)
        sendEvent({ 
          stage: "error", 
          message: error.message || "AI analysis temporarily unavailable. Please try again in a moment.", 
          progress: 0 
        })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
