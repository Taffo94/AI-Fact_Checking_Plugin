import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ status: 'ok', time: new Date().toISOString() });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
