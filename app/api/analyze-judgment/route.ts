import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/gemini/client';

const SYSTEM_PROMPT = `You are a legal AI assistant for Indian court judgments.
Analyze the judgment text and return ONLY a raw JSON object (no markdown, no backticks).

{
  "caseNumber": "e.g. WP(C) No. 1234/2024",
  "court": "Court name",
  "dateOfJudgment": "DD Month YYYY",
  "judges": ["Judge 1", "Judge 2"],
  "petitioners": ["Petitioner name"],
  "respondents": ["Respondent name"],
  "caseType": "PIL/Writ/Appeal/etc",
  "subject": "One-line subject",
  "summary": "3-4 sentence summary",
  "verdict": "Allowed/Dismissed/Disposed/Remanded/Partly Allowed",
  "priority": "CRITICAL/HIGH/MEDIUM/LOW",
  "complianceActions": [
    {
      "id": "DIR-001",
      "department": "Department name",
      "action": "What must be done",
      "deadline": "Deadline or duration",
      "priority": "HIGH/MEDIUM/LOW",
      "category": "Financial/Structural/Reporting/Enforcement/Other"
    }
  ],
  "penalties": "Fines or null",
  "nextHearingDate": "Date or null",
  "keyLegalSections": ["Article 21", "Section 15 EPA"],
  "estimatedComplianceDays": 30,
  "riskScore": 7
}`;

function parseJSON(raw: string): any {
  try {
    const cleaned = raw.replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '').trim();
    return JSON.parse(cleaned);
  } catch {}
  try {
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
    if (s !== -1 && e > s) return JSON.parse(raw.substring(s, e + 1));
  } catch {}
  throw new Error('Could not parse AI response as JSON');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let pdfText = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      pdfText = (await pdfParse(buffer)).text?.trim() || '';
    } catch {
      pdfText = buffer.toString('utf-8', 0, 15000);
    }

    if (pdfText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF.' }, { status: 400 });
    }

    const raw = await callGroq(`${SYSTEM_PROMPT}\n\nJudgment text:\n\n${pdfText.substring(0, 28000)}`);
    const parsed = parseJSON(raw);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('[analyze-judgment]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
