// app/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'onboarding_session';

interface SessionData {
  primary_email: string;
  registrationId: string;
}

export async function authMiddleware(req: NextRequest) {
  // Get session from cookie
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  let session: SessionData | null = null;

  try {
    session = sessionCookie ? (JSON.parse(sessionCookie) as SessionData) : null;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  if (!session?.primary_email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Clone the request to attach the session
  const requestWithSession = req.clone();
  // Attach the session to the request object
  (requestWithSession as any).session = session;

  return NextResponse.next({
    request: requestWithSession,
  });
}
