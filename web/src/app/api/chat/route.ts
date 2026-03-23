export const dynamic = 'force-dynamic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, videoId } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    messages: [
      { role: 'user', content: `Sei un Fact-Checker esperto (ID Video: ${videoId}). Rispondi basandoti sul contesto del video. Sii conciso.` },
      ...messages
    ],
  });

  const response = result.toTextStreamResponse();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
