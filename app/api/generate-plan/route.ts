import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGroq } from '@/lib/gemini/client';

const PLAN_PROMPT = (data: string) => `
You are a senior Indian government legal advisor. Create an action plan from this court judgment extraction.
Return ONLY raw JSON (no markdown, no backticks):

${data}

{
  "action_type": "compliance|appeal|both|no_action",
  "priority_level": "critical|high|medium|low",
  "summary": "2-3 sentences on what the government must do",
  "ai_reasoning": "why these actions are recommended",
  "compliance_actions": [
    {
      "action_id": 1,
      "action": "specific action",
      "responsible_authority": "authority name",
      "deadline": "YYYY-MM-DD",
      "deadline_source": "explicit|inferred|standard_practice",
      "priority": "immediate|within_week|within_month|ongoing",
      "steps": ["step 1", "step 2"],
      "documents_needed": ["document 1"]
    }
  ],
  "appeal_consideration": {
    "recommended": false,
    "reason": "explanation",
    "limitation_period": "90 days",
    "deadline": "YYYY-MM-DD",
    "grounds_for_appeal": [],
    "risk_if_no_appeal": "consequence"
  },
  "responsible_departments": ["Department 1"],
  "key_timelines": [
    {
      "event": "milestone",
      "date": "YYYY-MM-DD",
      "days_remaining": 30,
      "is_critical": true,
      "consequence_of_missing": "consequence"
    }
  ],
  "interdepartmental_coordination": "description or null"
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

    const { extractionId } = await req.json();
    const { data: extraction } = await supabase.from('extractions').select('*').eq('id', extractionId).single();
    if (!extraction) return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });

    const raw = await callGroq(PLAN_PROMPT(JSON.stringify(extraction)));
    const planData = parseJSON(raw);

    const { data: actionPlan, error } = await supabase
      .from('action_plans')
      .insert({ case_id: extraction.case_id, extraction_id: extraction.id, ...planData })
      .select().single();

    if (error) throw error;
    await supabase.from('cases').update({ status: 'pending_review' }).eq('id', extraction.case_id);

    return NextResponse.json({ success: true, actionPlan });
  } catch (error: any) {
    console.error('[generate-plan]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
