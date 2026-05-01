import { NextRequest } from 'next/server';
import { callGroq } from '@/lib/gemini/client';

export const dynamic = 'force-dynamic';

const PROMPT = `Analyze this Indian court judgment and return ONLY a raw JSON object (no markdown, no backticks):
{
  "caseTitle": "Case title",
  "caseNumber": "Case number or null",
  "courtName": "Court name",
  "judgmentDate": "YYYY-MM-DD or null",
  "bench": "Judge names or null",
  "summary": "2-3 sentence summary",
  "riskScore": 5,
  "estimatedComplianceDays": 30,
  "keyDirectives": ["directive 1"],
  "complianceActions": [{"action":"task","responsibleDepartment":"dept","deadline":"date","priority":"HIGH","category":"COMPLIANCE"}],
  "penalties": "fines or null",
  "nextHearingDate": "YYYY-MM-DD or null",
  "tags": ["tag1"]
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
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        send({ stage: 'parsing', message: 'Parsing PDF...', progress: 10 });
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const buffer = Buffer.from(await file.arrayBuffer());
        let pdfText = '';
        try {
          const pdfParse = (await import('pdf-parse')).default;
          pdfText = (await pdfParse(buffer)).text?.trim() || '';
        } catch {
          pdfText = buffer.toString('utf-8', 0, 15000);
        }

        send({ stage: 'analyzing', message: 'Analyzing with Groq AI...', progress: 40 });
        const raw = await callGroq(`${PROMPT}\n\nJudgment text:\n\n${pdfText.substring(0, 28000)}`);

        send({ stage: 'generating', message: 'Extracting compliance actions...', progress: 80 });
        const data = parseJSON(raw);

        send({ stage: 'complete', message: 'Analysis complete!', progress: 100, data });
        controller.close();
      } catch (error: any) {
        send({ stage: 'error', message: error.message, progress: 0 });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
