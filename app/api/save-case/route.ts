import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisData, caseNumber, department, pdfUrl, pdfFilename } = body;
    
    const supabase = createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Start a transaction-like flow by inserting everything together
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber || analysisData.caseNumber,
        title: analysisData.caseTitle || 'Untitled Case',
        court: analysisData.courtName,
        judgment_date: analysisData.judgmentDate ? new Date(analysisData.judgmentDate).toISOString().split('T')[0] : null,
        status: 'pending',
        priority: analysisData.complianceActions?.[0]?.priority || 'MEDIUM',
        department: department || analysisData.complianceActions?.[0]?.responsibleDepartment,
        summary: analysisData.summary,
        tags: analysisData.tags || [],
        penalties: analysisData.penalties,
        next_hearing_date: analysisData.nextHearingDate ? new Date(analysisData.nextHearingDate).toISOString().split('T')[0] : null,
        bench: analysisData.bench,
        pdf_url: pdfUrl,
        pdf_filename: pdfFilename,
        created_by: user.id,
        // Optimistic locking / versioning placeholder
        version: 1
      })
      .select()
      .single();

    if (caseError) {
      console.error('Case insert error:', caseError);
      throw new Error(`Failed to insert case: ${caseError.message}`);
    }

    // Insert compliance actions with transaction integrity
    if (analysisData.complianceActions?.length > 0) {
      const actions = analysisData.complianceActions
        .filter((a: any) => a.included !== false)
        .map((a: any) => ({
          case_id: caseRow.id,
          action: a.action,
          responsible_department: a.responsibleDepartment,
          deadline: a.deadline ? new Date(a.deadline).toISOString().split('T')[0] : null,
          priority: a.priority || 'MEDIUM',
          category: a.category || 'OTHER',
          status: 'pending',
          assigned_to: null,
        }));

      if (actions.length > 0) {
        const { error: actionsError } = await supabase
          .from('compliance_actions')
          .insert(actions);

        if (actionsError) {
          console.error('Actions insert error:', actionsError);
          // Manually roll back the case insertion if actions fail
          await supabase.from('cases').delete().eq('id', caseRow.id);
          throw new Error(`Failed to insert actions: ${actionsError.message}. Rolling back case insertion.`);
        }
      }
    }

    return NextResponse.json({ success: true, caseId: caseRow.id });
  } catch (error: any) {
    console.error('Save case error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
