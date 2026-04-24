import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractFromPDF(pdfBase64: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  // Note: the prompt will be passed from the route
  return model;
}
