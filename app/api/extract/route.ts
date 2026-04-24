import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const EXTRACTION_SYSTEM_PROMPT = `
You are a legal document analyst specializing in Indian court judgments. 
Analyze the provided court judgment PDF and extract the following information with high precision.

Return ONLY a valid JSON object with this exact structure:
{
  "case_number": "exact case number as written",
  "case_title": "petitioner vs respondent format",
  "petitioner": "name of petitioner",
  "respondent": "name of respondent / government department",
  "court_name": "name of court",
  "judge_name": "name of judge(s)",
  "date_of_order": "YYYY-MM-DD format",
  "key_directions": [
    {
      "direction_number": 1,
      "text": "exact direction text",
      "category": "compliance|payment|appointment|policy_change|inquiry|other",
      "addressee": "which department/authority this is directed to",
      "has_deadline": true,
      "deadline_text": "as mentioned in judgment or null"
    }
  ],
  "parties_involved": [
    {
      "name": "party name",
      "role": "petitioner|respondent|intervenor|amicus",
      "represented_by": "advocate name if mentioned"
    }
  ],
  "timelines": [
    {
      "event": "what must happen",
      "date": "YYYY-MM-DD or null",
      "date_text": "as written in judgment",
      "is_inferred": false,
      "days_from_order": null
    }
  ],
  "appeal_limitation_period": "X weeks/months as mentioned or null",
  "case_outcome": "allowed|dismissed|disposed|partly_allowed|remanded",
  "subject_matter": "brief topic like land acquisition, service matter, etc.",
  "confidence_score": 0.95,
  "extraction_notes": "any ambiguities or issues found"
}

Be thorough. If information is not found, use null. Do not hallucinate.
`;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, pdfBase64 } = await req.json();

    if (!caseId || !pdfBase64) {
      return NextResponse.json({ error: 'Missing caseId or pdfBase64' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Call Gemini API with the PDF
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      { text: EXTRACTION_SYSTEM_PROMPT },
    ]);

    const output = result.response.text();
    
    // Parse JSON
    let extractedData;
    try {
      const jsonStr = output.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse Gemini output as JSON:', output);
      return NextResponse.json({ error: 'Failed to parse AI output' }, { status: 500 });
    }

    // Update case status and create extraction record
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
        ai_model_used: 'gemini-1.5-pro'
      })
      .select()
      .single();

    if (extractionError) {
      console.error('Database error:', extractionError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Update case status
    await supabase.from('cases').update({ status: 'extracted' }).eq('id', caseId);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      case_id: caseId,
      action: 'extracted',
      details: { extraction_id: extraction.id }
    });

    return NextResponse.json({ success: true, extraction });

  } catch (error) {
    console.error('Extraction API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
