import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing in engine.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-3.7-flash',
    generationConfig: { 
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      temperature: 0.2,
    },
  });
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
