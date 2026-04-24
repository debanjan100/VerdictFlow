import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const ACTION_PLAN_PROMPT = (extractionJson: string) => `
You are a senior government legal advisor in India. Based on the following court judgment extraction, create a comprehensive action plan for the government department.

Extracted Data: ${extractionJson}

Return ONLY a valid JSON object:
{
  "action_type": "compliance|appeal|both|no_action",
  "priority_level": "critical|high|medium|low",
  "summary": "2-3 sentence plain language summary of what the government needs to do",
  "ai_reasoning": "explain why you recommend these actions",
  "compliance_actions": [
    {
      "action_id": 1,
      "action": "specific action to take",
      "responsible_authority": "specific official/department",
      "deadline": "YYYY-MM-DD",
      "deadline_source": "explicit|inferred|standard_practice",
      "priority": "immediate|within_week|within_month|ongoing",
      "steps": ["step 1", "step 2"],
      "documents_needed": ["list of required documents"]
    }
  ],
  "appeal_consideration": {
    "recommended": true,
    "reason": "why appeal is/isn't recommended",
    "limitation_period": "X weeks from judgment date",
    "deadline": "YYYY-MM-DD",
    "grounds_for_appeal": ["ground 1", "ground 2"],
    "risk_if_no_appeal": "consequence description"
  },
  "responsible_departments": ["Department 1", "Department 2"],
  "key_timelines": [
    {
      "event": "milestone name",
      "date": "YYYY-MM-DD",
      "days_remaining": 30,
      "is_critical": true,
      "consequence_of_missing": "what happens if missed"
    }
  ],
  "interdepartmental_coordination": "description if multiple depts involved"
}

Consider Indian government procedures, standard appeal periods (90 days for High Court), and realistic administrative timelines.
`;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { extractionId } = await req.json();

    if (!extractionId) {
      return NextResponse.json({ error: 'Missing extractionId' }, { status: 400 });
    }

    // Fetch extraction data
    const { data: extraction, error: fetchError } = await supabase
      .from('extractions')
      .select('*, cases(id, department_id)')
      .eq('id', extractionId)
      .single();

    if (fetchError || !extraction) {
      return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });
    }

    const extractionDataForAI = JSON.stringify({
      case_number: extraction.case_number,
      title: extraction.case_title,
      court: extraction.court_name,
      directions: extraction.key_directions,
      timelines: extraction.timelines,
      outcome: extraction.case_outcome
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Call Gemini API
    const response = await model.generateContent(ACTION_PLAN_PROMPT(extractionDataForAI));

    const output = response.response.text();
    
    // Parse JSON
    let planData;
    try {
      const jsonStr = output.replace(/```json/g, '').replace(/```/g, '').trim();
      planData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse Gemini output as JSON:', output);
      return NextResponse.json({ error: 'Failed to parse AI output' }, { status: 500 });
    }

    // Insert action plan
    const { data: actionPlan, error: insertError } = await supabase
      .from('action_plans')
      .insert({
        case_id: extraction.case_id,
        extraction_id: extraction.id,
        action_type: planData.action_type,
        priority_level: planData.priority_level,
        summary: planData.summary,
        ai_reasoning: planData.ai_reasoning,
        compliance_actions: planData.compliance_actions,
        appeal_consideration: planData.appeal_consideration,
        responsible_departments: planData.responsible_departments,
        key_timelines: planData.key_timelines,
        interdepartmental_coordination: planData.interdepartmental_coordination
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Update case status
    await supabase.from('cases').update({ status: 'pending_review' }).eq('id', extraction.case_id);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      case_id: extraction.case_id,
      action: 'action_plan_generated',
      details: { action_plan_id: actionPlan.id }
    });

    return NextResponse.json({ success: true, actionPlan });

  } catch (error) {
    console.error('Generate Plan API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
