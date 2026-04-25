import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import pdfParse from "pdf-parse"

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
  "estimatedComplianceDays": 0, // average days to complete all actions
  "riskScore": 0 // number between 1-10 — 10 being highest non-compliance risk
}
`

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 })
    }

    // 1. Parse PDF
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let pdfText = ""
    try {
      const pdfData = await pdfParse(buffer)
      pdfText = pdfData.text
      
      if (!pdfText || pdfText.trim().length < 50) {
        return NextResponse.json({ 
          error: "This PDF appears to be a scanned image. Please upload a text-based PDF or use OCR first." 
        }, { status: 400 })
      }
    } catch (parseError) {
      console.error("PDF Parse Error:", parseError)
      return NextResponse.json({ 
        error: "Could not parse this file. Please ensure it is a valid PDF document." 
      }, { status: 400 })
    }

    // 2. Call Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `${SYSTEM_PROMPT}\n\nHere is the judgment text to analyze:\n\n${pdfText}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // 3. Parse JSON from response
    // Sometimes the model wraps it in ```json ... ```
    let jsonStr = responseText.trim()
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim()
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim()
    }

    const parsedJson = JSON.parse(jsonStr)

    return NextResponse.json(parsedJson)

  } catch (error: any) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ 
      error: "AI analysis temporarily unavailable. Please try again in a moment.",
      details: error.message 
    }, { status: 500 })
  }
}
