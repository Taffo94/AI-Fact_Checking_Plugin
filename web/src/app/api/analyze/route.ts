import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

const SYSTEM_PROMPT = `Sei un Fact-Checker esperto. Analizza la trascrizione, estrai dichiarazioni fattuali (numeri, date, leggi) e assegna un verdetto [VERO, FALSO, PARZIALE]. Includi il timestamp e una breve spiegazione. 
Aggiungi anche un array di stringhe "sources" contenente URL COMPLETI (iniziando con http:// o https://) di fonti autorevoli che confermano o smentiscono il claim. Includi almeno 2-3 link se possibile. Se non trovi URL specifici, usa nomi di testate famose.
Restituisci l'output ESCLUSIVAMENTE come un oggetto JSON con la seguente struttura:
{
  "claims": [
    {
      "claim": "string",
      "verdict": "VERO" | "FALSO" | "PARZIALE",
      "timestamp": "string (format MM:SS)",
      "explanation": "string",
      "sources": ["https://url-della-fonte.com"]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log(`Analyzing video: ${videoId}`);

    // 1. Get Transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const fullTranscript = transcriptItems.map(item => `[${Math.floor(item.offset / 1000)}s] ${item.text}`).join(' ');
    console.log(`Transcript fetched. Length: ${fullTranscript.length} chars`);

    // 2. Analyze with Gemini 2.0 Flash
    console.log(`Analyzing with Gemini 2.0 Flash...`);
    
    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      system: SYSTEM_PROMPT,
      prompt: `Analizza questa trascrizione di un video YouTube e identifica i claim principali:\n\n${fullTranscript}`,
      schema: z.object({
        claims: z.array(z.object({
          claim: z.string(),
          verdict: z.enum(['VERO', 'FALSO', 'PARZIALE']),
          timestamp: z.string(),
          explanation: z.string(),
          sources: z.array(z.string()).optional(),
        }))
      }),
    });

    console.log(`Analysis complete. Found ${object.claims?.length || 0} claims.`);

    const response = NextResponse.json({ claims: object.claims || [] });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    console.error('Analysis error:', error);
    const errResponse = NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    errResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errResponse;
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
