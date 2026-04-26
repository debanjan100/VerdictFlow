import { NextResponse } from 'next/server'; 
import { GoogleGenerativeAI } from '@google/generative-ai'; 
 
export async function GET() { 
   try { 
     const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
     const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
     const response = await model.generateContent('Say: GEMINI_WORKING');
     const text = response.response.text();
     return NextResponse.json({ ok: true, text }); 
   } catch (err: any) { 
     return NextResponse.json({ ok: false, error: err.message }, { status: 500 }); 
   } 
 } 
