import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';

export async function middleware(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken) {
      return new NextResponse(JSON.stringify({ success: false, message: 'CSRF token missing' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isValidCSRF = await validateCSRFToken(csrfToken);
    if (!isValidCSRF) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
