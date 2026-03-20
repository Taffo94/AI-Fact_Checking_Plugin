import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

const SYSTEM_PROMPT = `Sei un Fact-Checker esperto. Analizza la trascrizione, estrai dichiarazioni fattuali e assegna un verdetto [VERO, FALSO, PARZIALE].
Per ogni claim, fornisci una spiegazione e un array "sources" di fonti autorevoli.
IMPORTANTE SUI LINK: 
- Fornisci solo URL di cui sei ASSOLUTAMENTE certo (es. Wikipedia, siti istituzionali, testate famose). 
- NON inventare deep-link o frammenti di testo se non sei sicuro che funzionino. 
- Se non conosci l'URL esatto, scrivi solo il nome della fonte (es. "Fonte: ANSA", "Rapporto ISTAT 2023").
Restituisci l'output ESCLUSIVAMENTE come JSON:
{
  "claims": [
    {
      "claim": "string",
      "verdict": "VERO" | "FALSO" | "PARZIALE",
      "timestamp": "string",
      "explanation": "string",
      "sources": ["https://url-reale.com", "Nome Fonte Autorità"]
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
