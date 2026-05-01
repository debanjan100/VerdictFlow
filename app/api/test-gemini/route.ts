import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/gemini/client';

export async function GET() {
  try {
    const text = await callGroq('Say exactly: GROQ_WORKING');
    return NextResponse.json({ ok: true, text, model: 'groq/llama-3.3-70b-versatile' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
