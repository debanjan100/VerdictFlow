import { NextResponse } from 'next/server'; 
import { GoogleGenAI } from '@google/genai'; 
 
export async function GET() { 
   try { 
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); 
     const response = await ai.models.generateContent({ 
       model: 'gemini-1.5-flash', 
       contents: [{ role: 'user', parts: [{ text: 'Say: GEMINI_WORKING' }] }], 
     }); 
     const text = response.candidates?.[0]?.content?.parts?.[0]?.text; 
     return NextResponse.json({ ok: true, text }); 
   } catch (err: any) { 
     return NextResponse.json({ ok: false, error: err.message }, { status: 500 }); 
   } 
 } 
