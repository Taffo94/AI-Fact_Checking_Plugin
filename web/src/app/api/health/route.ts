import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  await headers(); // Force dynamic
  const response = NextResponse.json({ status: 'ok', time: new Date().toISOString() });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
