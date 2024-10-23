import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';

export async function csrfMiddleware(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken) {
      return NextResponse.json({ success: false, message: 'CSRF token missing' }, { status: 403 });
    }

    const isValidCSRF = await validateCSRFToken(csrfToken);
    if (!isValidCSRF) {
      return NextResponse.json({ success: false, message: 'Invalid CSRF token' }, { status: 403 });
    }
  }

  return NextResponse.next();
}
