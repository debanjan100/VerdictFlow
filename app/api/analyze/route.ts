import { NextRequest, NextResponse } from 'next/server'; 
import { GoogleGenerativeAI } from '@google/generative-ai'; 
 
export const maxDuration = 60; 
export const dynamic = 'force-dynamic'; 

// Exponential backoff retry utility
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Check if error is retryable (e.g., 429 Too Many Requests or 5xx server errors)
    const isRetryable = error?.message?.includes('429') || error?.message?.includes('500') || error?.message?.includes('503');
    
    if (!isRetryable) throw error;

    console.warn(`[Gemini API] Error encountered. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}
 
const ANALYSIS_PROMPT = `You are an expert Indian legal analyst. Analyze this court judgment PDF. 
Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON. 
 
 { 
   "caseTitle": "Full case title e.g. Petitioner vs Respondent", 
   "caseNumber": "e.g. WP(C) 1234/2024 or null", 
   "courtName": "Name of court", 
   "judgmentDate": "YYYY-MM-DD or null", 
   "bench": "Judge names or null", 
   "summary": "2-3 sentence plain English summary of the judgment", 
   "keyDirectives": ["directive 1", "directive 2"], 
   "complianceActions": [ 
     { 
       "action": "Specific action to be taken", 
       "responsibleDepartment": "Department name", 
       "deadline": "YYYY-MM-DD or null", 
       "priority": "HIGH or MEDIUM or LOW", 
       "category": "FINANCIAL or INFRASTRUCTURE or POLICY or REPORTING or OTHER" 
     } 
   ], 
   "penalties": "Any fines or penalties mentioned, or null", 
   "nextHearingDate": "YYYY-MM-DD or null", 
   "tags": ["tag1", "tag2"] 
 }`; 
 
export async function POST(req: NextRequest) { 
   const correlationId = crypto.randomUUID();
   console.log(`[Analyze Request] Correlation ID: ${correlationId}`);

   try { 
     const formData = await req.formData(); 
     const file = formData.get('file') as File | null; 
 
     if (!file) { 
       return NextResponse.json({ error: 'No file provided', correlationId }, { status: 400 }); 
     } 
 
     if (!file.name.toLowerCase().endsWith('.pdf')) { 
       return NextResponse.json({ error: 'Only PDF files are supported', correlationId }, { status: 400 }); 
     } 
 
     // Convert PDF to base64 
     const arrayBuffer = await file.arrayBuffer(); 
     const base64Data = Buffer.from(arrayBuffer).toString('base64'); 
 
     const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
     const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });
 
     const response = await withRetry(async () => {
       return await model.generateContent([ 
         {
           inlineData: {
             mimeType: 'application/pdf',
             data: base64Data,
           },
         },
         ANALYSIS_PROMPT,
       ]);
     });
     
     const rawText = response.response.text(); 
 
     if (!rawText) { 
       throw new Error('Gemini returned an empty response'); 
     } 
 
     // Strip markdown fences if present 
     const cleaned = rawText 
       .replace(/^```json\s*/i, '') 
       .replace(/^```\s*/i, '') 
       .replace(/\s*```$/i, '') 
       .trim(); 
 
     let parsed: any; 
     try { 
       parsed = JSON.parse(cleaned); 
     } catch { 
       // If JSON parse fails, return the raw text so we can debug 
       console.error(`[JSON Parse Error] Correlation ID: ${correlationId}. Raw output:`, rawText); 
       return NextResponse.json( 
         { error: 'AI returned malformed JSON', raw: rawText, correlationId }, 
         { status: 500 } 
       ); 
     } 
 
     return NextResponse.json({ success: true, data: parsed, correlationId }); 
   } catch (error: any) { 
     console.error(`[Analyze Error] Correlation ID: ${correlationId}. Error:`, error); 
     
     // Specific error code mapping
     let status = 500;
     let message = error?.message ?? 'Analysis failed';
     
     if (message.includes('429')) {
       status = 429;
       message = 'AI Quota exceeded. Please try again later.';
     } else if (message.includes('401') || message.includes('403')) {
       status = 401;
       message = 'AI Authentication failed. Please check API configuration.';
     }

     return NextResponse.json( 
       { error: message, correlationId }, 
       { status } 
     ); 
   } 
 } 
