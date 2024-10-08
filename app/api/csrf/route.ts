import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

export async function GET() {
  const csrfToken = await generateCSRFToken();
  return NextResponse.json({ csrfToken });
}
