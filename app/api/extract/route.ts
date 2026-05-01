import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGroq } from '@/lib/gemini/client';

const PROMPT = `You are a legal document analyst for Indian courts.
Extract from this judgment and return ONLY raw JSON (no markdown):
{
  "case_number": "exact case number",
  "case_title": "petitioner vs respondent",
  "petitioner": "petitioner name",
  "respondent": "respondent name",
  "court_name": "court name",
  "judge_name": "judge name(s)",
  "date_of_order": "YYYY-MM-DD or null",
  "key_directions": [{"direction_number":1,"text":"direction","category":"compliance","addressee":"department","has_deadline":true,"deadline_text":"date or null"}],
  "parties_involved": [{"name":"party","role":"petitioner|respondent","represented_by":"advocate or null"}],
  "timelines": [{"event":"what must happen","date":"YYYY-MM-DD or null","date_text":"as written","is_inferred":false,"days_from_order":null}],
  "appeal_limitation_period": "X weeks or null",
  "case_outcome": "allowed|dismissed|disposed|partly_allowed|remanded",
  "subject_matter": "brief topic",
  "confidence_score": 0.9,
  "extraction_notes": "any notes or null"
}`;

function parseJSON(raw: string): any {
  try {
    return JSON.parse(raw.replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '').trim());
  } catch {}
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
  if (s !== -1 && e > s) return JSON.parse(raw.substring(s, e + 1));
  throw new Error('Could not parse AI response');
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { caseId, pdfBase64 } = await req.json();
    if (!caseId || !pdfBase64) return NextResponse.json({ error: 'Missing caseId or pdfBase64' }, { status: 400 });

    const buffer = Buffer.from(pdfBase64, 'base64');
    let pdfText = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      pdfText = (await pdfParse(buffer)).text?.trim() || '';
    } catch {
      pdfText = buffer.toString('utf-8', 0, 15000);
    }

    const raw = await callGroq(`${PROMPT}\n\nJudgment text:\n\n${pdfText.substring(0, 28000)}`);
    const extractedData = parseJSON(raw);

    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .insert({
        case_id: caseId,
        case_number: extractedData.case_number,
        case_title: extractedData.case_title,
        petitioner: extractedData.petitioner,
        respondent: extractedData.respondent,
        court_name: extractedData.court_name,
        date_of_order: extractedData.date_of_order,
        judge_name: extractedData.judge_name,
        key_directions: extractedData.key_directions,
        parties_involved: extractedData.parties_involved,
        timelines: extractedData.timelines,
        appeal_limitation_period: extractedData.appeal_limitation_period,
        case_outcome: extractedData.case_outcome,
        subject_matter: extractedData.subject_matter,
        confidence_score: extractedData.confidence_score,
        extraction_notes: extractedData.extraction_notes,
        ai_model_used: 'groq/llama-3.3-70b-versatile'
      })
      .select().single();

    if (extractionError) throw extractionError;

    await supabase.from('cases').update({ status: 'extracted' }).eq('id', caseId);
    return NextResponse.json({ success: true, extraction });
  } catch (error: any) {
    console.error('[extract]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
