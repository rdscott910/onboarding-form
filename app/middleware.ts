import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/middleware/auth';
import { csrfMiddleware } from '@/app/middleware/csrf';
import { loggingMiddleware } from '@/app/middleware/logging';

export async function middleware(req: NextRequest) {
  // Skip auth for public endpoints
  const publicPaths = ['/api/csrf', '/api/save-form-data'];
  const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  const response = await loggingMiddleware(req);
  if (response) return response;

  const csrfResponse = await csrfMiddleware(req);
  if (csrfResponse) return csrfResponse;

  // Only apply auth middleware for protected routes
  if (!isPublicPath) {
    const authResponse = await authMiddleware(req);
    if (authResponse) return authResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
