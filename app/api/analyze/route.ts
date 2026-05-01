import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/gemini/client';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const ANALYSIS_PROMPT = `You are an expert Indian legal analyst. Analyze the court judgment text below and extract details.

CRITICAL RULES:
- Respond ONLY with a raw JSON object. No markdown, no code fences, no backticks, no explanation.
- complianceActions MUST be an array (use [] if none found).
- Use null for missing data, not empty strings.

Required JSON structure:
{
  "caseTitle": "Full case title e.g. Ram Lal vs State of Delhi",
  "caseNumber": "e.g. WP(C) 1234/2024 or null",
  "courtName": "Name of the court",
  "judgmentDate": "YYYY-MM-DD or null",
  "bench": "Judge name(s) or null",
  "summary": "2-3 sentence plain English summary of the judgment and its impact",
  "riskScore": 7,
  "estimatedComplianceDays": 30,
  "keyDirectives": ["Key directive 1", "Key directive 2"],
  "complianceActions": [
    {
      "action": "Specific action that must be taken",
      "responsibleDepartment": "Responsible department or authority",
      "deadline": "YYYY-MM-DD or descriptive deadline",
      "priority": "HIGH",
      "category": "COMPLIANCE"
    }
  ],
  "penalties": "Description of any fines or penalties imposed, or null",
  "nextHearingDate": "YYYY-MM-DD or null",
  "tags": ["relevant", "legal", "tags"]
}`;

function parseJSON(raw: string): any {
  // Strategy 1: strip markdown fences
  try {
    const cleaned = raw
      .replace(/^```json\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/\s*```$/im, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {}

  // Strategy 2: find first { ... last }
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(raw.substring(start, end + 1));
    }
  } catch {}

  throw new Error('AI returned unreadable data. Please try again.');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 });
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let pdfText = '';

    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text?.trim() || '';
    } catch {
      pdfText = buffer.toString('utf-8', 0, 15000);
    }

    if (!pdfText || pdfText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Please ensure it is a text-based PDF (not a scanned image).' },
        { status: 400 }
      );
    }

    console.log(`[Analyze] ${file.name}: ${pdfText.length} chars extracted. Calling Groq...`);

    const prompt = `${ANALYSIS_PROMPT}\n\n--- COURT JUDGMENT TEXT ---\n\n${pdfText.substring(0, 28000)}`;
    const rawText = await callGroq(prompt);

    if (!rawText) throw new Error('AI returned an empty response');

    const parsed = parseJSON(rawText);

    // Normalize with safe defaults
    const safeData = {
      caseTitle: parsed.caseTitle || 'Untitled Case',
      caseNumber: parsed.caseNumber || null,
      courtName: parsed.courtName || 'Unknown Court',
      judgmentDate: parsed.judgmentDate || null,
      bench: parsed.bench || null,
      summary: parsed.summary || 'Summary not available.',
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 5,
      estimatedComplianceDays: typeof parsed.estimatedComplianceDays === 'number' ? parsed.estimatedComplianceDays : 30,
      keyDirectives: Array.isArray(parsed.keyDirectives) ? parsed.keyDirectives : [],
      complianceActions: Array.isArray(parsed.complianceActions) ? parsed.complianceActions : [],
      penalties: parsed.penalties || null,
      nextHearingDate: parsed.nextHearingDate || null,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };

    console.log(`[Analyze] Success: ${safeData.complianceActions.length} actions found`);
    return NextResponse.json({ success: true, data: safeData });

  } catch (error: any) {
    console.error('[Analyze] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
