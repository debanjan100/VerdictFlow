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
  "caseTitle": "string — full title like Petitioner vs Respondent",
  "caseNumber": "string — e.g. WP(C) No. 1234/2024",
  "courtName": "string — e.g. Supreme Court of India",
  "judgmentDate": "YYYY-MM-DD or null",
  "bench": "string — Judge names or null",
  "summary": "string — 3-4 sentence plain-English summary of the judgment",
  "keyDirectives": ["array of major directives or orders from the court"],
  "complianceActions": [
    {
      "action": "string — what exactly must be done (full description)",
      "responsibleDepartment": "string — which government department must act",
      "deadline": "YYYY-MM-DD or null",
      "priority": "HIGH | MEDIUM | LOW",
      "category": "FINANCIAL | INFRASTRUCTURE | POLICY | REPORTING | OTHER"
    }
  ],
  "penalties": "string — any fines or costs imposed, or null",
  "nextHearingDate": "YYYY-MM-DD or null",
  "tags": ["array of laws/sections cited e.g. Article 21, Section 15 EPA"]
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
        const base64Data = Buffer.from(arrayBuffer).toString('base64')

        sendEvent({ stage: "extracting", message: "Sending to Gemini AI...", progress: 30 })

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

        const prompt = SYSTEM_PROMPT

        sendEvent({ stage: "analyzing", message: "Analyzing legal language...", progress: 50 })

        const resultStream = await model.generateContentStream([
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          { text: prompt },
        ])
        
        let fullText = ""
        let isGenerating = false
        
        for await (const chunk of resultStream.stream) {
          if (!isGenerating) {
            sendEvent({ stage: "generating", message: "Extracting compliance actions...", progress: 75 })
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
