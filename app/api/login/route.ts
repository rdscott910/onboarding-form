import { NextResponse } from 'next/server';
import { rotateCSRFToken } from '@/lib/csrf';

// NOTE: Endpoint not implemented yet in production
export async function POST(request: Request) {
  const { username, password, csrfToken } = await request.json();

  // TODO: Implement the login logic
  const loginSuccessful = true;

  if (loginSuccessful) {
    const newCsrfToken = await rotateCSRFToken(csrfToken);
    if (newCsrfToken) {
      return NextResponse.json({ success: true, newCsrfToken });
    }
  }

  return NextResponse.json({ success: false });
}
