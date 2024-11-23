import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAuthMiddleware } from '@/app/middleware/supabase-auth';
import { loggingMiddleware } from '@/app/middleware/logging';

export async function middleware(request: NextRequest) {
  // Apply logging middleware
  await loggingMiddleware(request);

  // Apply Supabase auth middleware
  const response = await supabaseAuthMiddleware(request);

  // Return the response
  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
